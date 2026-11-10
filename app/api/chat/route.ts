import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BANNED_PHRASES, FORBIDDEN_DOMAINS } from "@/config/banned-phrases";
import { INDICATIVE_RANGE, PARTNER_NAME } from "@/config/site";
import { STEP_KEYS, STEPS, localParse, validateAnswer, type ChatStep } from "@/lib/chat-flow";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Override with CHAT_MODEL if you want a different Claude model. */
const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";

const bodySchema = z.object({
  step: z.enum(STEP_KEYS),
  text: z.string().trim().min(1).max(600),
  history: z
    .array(z.object({ role: z.enum(["bot", "user"]), text: z.string().max(1200) }))
    .max(60)
    .default([]),
});

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    answer: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["reply", "answer"],
  additionalProperties: false,
} as const;

function answerFormat(step: ChatStep): string {
  switch (step.kind) {
    case "choice":
      return `exactly one of these values: ${step.options!.map((o) => `"${o.value}" (${o.label})`).join(", ")}`;
    case "multi":
      return `a comma-separated list of these values, no spaces: ${step.options!.map((o) => `"${o.value}" (${o.label})`).join(", ")}. Map tools to the closest option; use "other" for anything unlisted`;
    case "number":
      return "a whole number written with digits only. If they give a range, use the lower end";
    case "name":
      return "their first and last name";
    case "email":
      return "their email address";
    case "text":
      return "the text they gave";
    case "optional":
      return 'the text they gave, or "" if they want to skip';
    case "consent":
      return "null (consent is only accepted through the buttons)";
  }
}

function fallbackReply(step: ChatStep): string {
  return step.options
    ? "Please pick one of the options below so I can keep going. " + `${PARTNER_NAME} can answer anything else on your call.`
    : `I didn't quite catch that. ${PARTNER_NAME} can answer questions on your call. For now: ${step.question}`;
}

const DOLLAR = /\$\s?[\d.,]+\s?[KMB]?/gi;
const norm = (d: string) => d.replace(/\s/g, "").toUpperCase();
/** The only dollar figures the bot may say are the ones in the published range sentence. */
const ALLOWED_DOLLARS = new Set((INDICATIVE_RANGE.match(DOLLAR) ?? []).map(norm));

/** Last line of defence: drop any model reply that breaks the site's copy rules. */
function safeReply(reply: string, step: ChatStep): string {
  const lower = reply.toLowerCase();
  const badDollar = (reply.match(DOLLAR) ?? []).some((d) => !ALLOWED_DOLLARS.has(norm(d)));
  if (
    BANNED_PHRASES.some((p) => lower.includes(p)) ||
    FORBIDDEN_DOMAINS.some((d) => lower.includes(d)) ||
    /\bMode\b/.test(reply) ||
    badDollar ||
    reply.length > 900
  ) {
    return `Good question. ${PARTNER_NAME} can cover that on your call. For now: ${step.question}`;
  }
  return reply.replace(/[*_#`]/g, "").trim();
}

let client: Anthropic | null = null;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`chat:${ip}`, 80))) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { step: stepKey, text, history } = parsed.data;
  const step = STEPS[stepKey];

  // Consent is never inferred from free text.
  if (step.kind === "consent") {
    return NextResponse.json({ reply: "Please tap Yes or No thanks below.", answer: null, ai: false });
  }

  const local = validateAnswer(step, localParse(step, text));

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: local ? "" : fallbackReply(step), answer: local, ai: false });
  }

  client ??= new Anthropic();
  const transcript = history
    .slice(-24)
    .map((m) => `${m.role === "bot" ? "Assistant" : "Visitor"}: ${m.text}`)
    .join("\n");

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: CHAT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `Conversation so far:\n${transcript || "(none)"}\n\nCurrent question: ${step.question}\nExpected answer format: ${answerFormat(step)}.\n\n<visitor_message>\n${text}\n</visitor_message>`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ reply: local ? "" : fallbackReply(step), answer: local, ai: false });
    }

    const raw = response.content.find((b) => b.type === "text");
    const out = raw && raw.type === "text" ? (JSON.parse(raw.text) as { reply?: string; answer?: string | null }) : null;
    if (!out) throw new Error("no text block");

    let answer = validateAnswer(step, out.answer);
    if (step.kind === "optional" && out.answer === "") answer = "";
    if (answer === null && local !== null) answer = local;
    const reply = safeReply(out.reply ?? "", step);

    return NextResponse.json({ reply: answer === null && !reply ? fallbackReply(step) : reply, answer, ai: true });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn("[chat] Anthropic rate limited");
    else if (err instanceof Anthropic.APIError) console.error(`[chat] Anthropic API error ${err.status}`, err.message);
    else console.error("[chat] error", err);
    return NextResponse.json({ reply: local ? "" : fallbackReply(step), answer: local, ai: false });
  }
}
