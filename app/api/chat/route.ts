import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { cleanAgentReply } from "@/lib/agent-reply";
import { ATTRIB_COOKIE, decodeAttribution } from "@/lib/attribution";
import { newLeadId, signLeadToken, verifyLeadToken } from "@/lib/lead-token";
import { postToWebhook } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AGENT_URL = (agentId: string) => `https://services.leadconnectorhq.com/agent-studio/managed-agents/${agentId}/execute`;

const bodySchema = z.object({
  message: z.string().trim().min(1).max(1500),
  sessionId: z.string().max(100).optional(),
  /** Set once per session after the agent qualifies the visitor, so we sign one lead id per chat. */
  leadId: z.string().max(120).optional(),
  niche: z.string().max(60).optional(),
});

type AgentResponse = { success?: boolean; sessionId?: string; finalText?: string; message?: string };

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`chat:${ip}`, 80))) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { message, sessionId, niche } = parsed.data;

  const token = process.env.GHL_API_TOKEN;
  const agentId = process.env.GHL_AGENT_ID;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !agentId || !locationId) {
    console.error("[chat] GHL_API_TOKEN, GHL_AGENT_ID or GHL_LOCATION_ID is not set");
    return NextResponse.json({ error: "The assistant is offline right now. Please try again later." }, { status: 503 });
  }

  let data: AgentResponse;
  try {
    const res = await fetch(AGENT_URL(agentId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Version: "v3",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({ locationId, message, ...(sessionId ? { sessionId } : {}) }),
      cache: "no-store",
      signal: AbortSignal.timeout(55_000),
    });
    data = (await res.json().catch(() => ({}))) as AgentResponse;
    if (!res.ok || !data.finalText) {
      console.error(`[chat] agent returned ${res.status}`, JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: "The assistant didn't respond. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("[chat] agent request failed", err);
    return NextResponse.json({ error: "The assistant is taking too long. Please try again." }, { status: 504 });
  }

  const reply = cleanAgentReply(data.finalText);
  // A lead id from the browser only counts if our signature checks out.
  let leadId = (await verifyLeadToken(parsed.data.leadId)) ? parsed.data.leadId : undefined;

  // First time the agent qualifies this visitor: sign a lead id (unlocks the booking
  // calendar and ties a Calendly booking back to this chat) and notify the CRM webhook.
  if (reply.qualified && !leadId) {
    const id = newLeadId();
    leadId = await signLeadToken(id, "strong");
    const attribution = decodeAttribution(req.cookies.get(ATTRIB_COOKIE)?.value);
    await postToWebhook({
      type: "chat_qualified",
      leadId,
      leadShortId: id,
      at: new Date().toISOString(),
      agentSessionId: data.sessionId ?? sessionId ?? null,
      niche: niche ?? attribution.niche ?? null,
      attribution,
    });
  }

  return NextResponse.json({
    reply: reply.text,
    sessionId: data.sessionId ?? sessionId,
    qualified: !!leadId,
    leadId,
  });
}
