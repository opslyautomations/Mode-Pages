"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Check, Minus, RotateCcw, X } from "lucide-react";
import { PARTNER_EMAIL, PARTNER_NAME, SITE_NAME, isTodo } from "@/config/site";
import { NICHES } from "@/content/niches";
import { STEPS, STEP_KEYS, localParse, looksLikeQuestion, type StepKey } from "@/lib/chat-flow";
import { YEARS } from "@/lib/lead-schema";
import type { Reason, Tier } from "@/lib/scoring";
import { readAttributionClient } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import { saveResult, type StoredResult } from "@/lib/result-store";
import { CalendlyEmbed } from "./CalendlyEmbed";

type Msg = { id: number; role: "bot" | "user"; text: string };
type Answers = Partial<Record<StepKey, string>>;
type Result = { tier: Tier; leadId: string; reasons: Reason[]; stored: StoredResult };

let nextId = 1;
const bot = (text: string): Msg => ({ id: nextId++, role: "bot", text });
const user = (text: string): Msg => ({ id: nextId++, role: "user", text });

/** Which steps still need asking, in order, given what's answered so far. */
function remainingSteps(a: Answers): StepKey[] {
  return STEP_KEYS.filter((k) => {
    if (a[k] !== undefined) return false;
    if (k === "smsConsent" && !a.phone) return false;
    return true;
  });
}

function labelFor(key: StepKey, value: string): string {
  const step = STEPS[key];
  if (step.kind === "multi") return value.split(",").map((v) => step.options?.find((o) => o.value === v)?.label ?? v).join(", ");
  if (step.options) return step.options.find((o) => o.value === value)?.label ?? value;
  if (step.kind === "optional" && value === "") return "Skip";
  return value;
}

export function ChatQualifier() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [niche, setNiche] = useState<string | null>(null);
  const [episode, setEpisode] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<"chat" | "submitting" | "done" | "error">("chat");
  const [result, setResult] = useState<Result | null>(null);
  const [fax, setFax] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  const current: StepKey | undefined = phase === "chat" ? remainingSteps(answers)[0] : undefined;
  const step = current ? STEPS[current] : null;

  // Greeting. A podcast vanity link (?niche=law-firms) pre-fills the industry.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const a = readAttributionClient();
    const slug = params.get("niche") ?? a.niche ?? null;
    const preset = NICHES.find((n) => n.slug === slug);
    const ep = params.get("ep") ?? a.ep ?? undefined;
    setEpisode(ep ?? undefined);
    const intro = [bot(`Hi, I'm the ${SITE_NAME} assistant. I'll ask about eight quick questions to see if your company may qualify, then you can book a 15-minute call with ${PARTNER_NAME}. Ask me anything along the way.`)];
    if (preset) {
      setNiche(preset.slug);
      setAnswers({ industry: preset.industry });
      intro.push(bot(`I see you're with ${preset.label.toLowerCase()}. Let's start there.`), bot(STEPS.location.question));
    } else {
      intro.push(bot(STEPS.industry.question));
    }
    setMessages(intro);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, phase]);

  // Once the result is in, the card grows to fit the booking calendar; bring the result into view.
  useEffect(() => {
    if (phase === "done") resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [phase]);

  function advance(next: Answers, extra: Msg[] = []) {
    setAnswers(next);
    setPicked([]);
    const upcoming = remainingSteps(next)[0];
    const count = STEP_KEYS.length - remainingSteps(next).length;
    track(`qualifier_step_${count}`, { mode: "chat" });
    if (Object.keys(next).length === 1 || (niche && Object.keys(next).length === 2)) track("qualifier_start", { mode: "chat" });
    if (upcoming) {
      setMessages((m) => [...m, ...extra, bot(STEPS[upcoming].question)]);
    } else {
      setMessages((m) => [...m, ...extra]);
      void submit(next);
    }
  }

  function choose(value: string, shown?: string) {
    if (!current) return;
    advance({ ...answers, [current]: value }, [user(shown ?? labelFor(current, value))]);
  }

  async function onSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !current || !step || typing) return;
    setInput("");

    const local = localParse(step, text);
    if (local !== null && !looksLikeQuestion(text)) {
      advance({ ...answers, [current]: local }, [user(text)]);
      return;
    }

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, user(text)]);
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: current, text, history }),
      });
      const data = (await res.json()) as { reply?: string; answer?: string | null; error?: string };
      setTyping(false);
      if (!res.ok) {
        setMessages((m) => [...m, bot(data.error ?? "Something went wrong. Please pick an option or try again.")]);
        return;
      }
      const reply = data.reply?.trim();
      if (data.answer !== null && data.answer !== undefined) {
        advance({ ...answers, [current]: data.answer }, reply ? [bot(reply)] : []);
      } else {
        setMessages((m) => [...m, bot(reply || step.question)]);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [...m, bot("I couldn't reach the server. Please check your connection and try again.")]);
    }
    inputRef.current?.focus();
  }

  async function submit(a: Answers) {
    setPhase("submitting");
    setTyping(true);
    const [firstName, ...rest] = (a.name ?? "").trim().split(/\s+/);
    const lastName = rest.join(" ");
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            industry: a.industry,
            location: a.location,
            deskEmployees: Number(a.deskEmployees),
            years: a.years,
            systems: (a.systems ?? "").split(",").filter(Boolean),
            ownership: a.ownership,
            priorContact: a.priorContact,
          },
          contact: {
            firstName,
            lastName,
            email: a.email,
            company: a.company,
            website: a.website ?? "",
            role: a.role,
            phone: a.phone ?? "",
            emailConsent: a.emailConsent === "yes",
            smsConsent: a.smsConsent === "yes",
          },
          niche: niche ?? undefined,
          episode,
          pageUrl: window.location.href.slice(0, 500),
          fax,
        }),
      });
      const data = (await res.json()) as { tier?: Tier; reasons?: Reason[]; leadId?: string; manualReview?: boolean; emailSent?: boolean; error?: string };
      setTyping(false);
      if (!res.ok || !data.tier || !data.leadId) {
        setPhase("error");
        setMessages((m) => [...m, bot(data.error ?? "Something went wrong saving your answers. Please try again.")]);
        return;
      }
      const stored: StoredResult = {
        leadId: data.leadId,
        tier: data.tier,
        reasons: data.reasons ?? [],
        manualReview: !!data.manualReview,
        emailSent: !!data.emailSent,
        emailConsent: a.emailConsent === "yes",
        niche: niche ?? "",
        industry: a.industry ?? "",
        episode,
        prefill: {
          name: `${firstName} ${lastName}`.trim(),
          email: (a.email ?? "").trim(),
          company: (a.company ?? "").trim(),
          website: (a.website ?? "").trim(),
          deskEmployees: Number(a.deskEmployees),
          years: YEARS.find((y) => y.value === a.years)?.label ?? a.years ?? "",
        },
      };
      saveResult(stored);
      track("qualifier_complete", { tier: data.tier, niche: niche ?? a.industry ?? "", ep: episode ?? "", mode: "chat" });
      setResult({ tier: data.tier, leadId: data.leadId, reasons: data.reasons ?? [], stored });
      setPhase("done");
      setMessages((m) => [...m, ...resultMessages(data.tier!, data.reasons ?? [], firstName, a.emailConsent === "yes")]);
    } catch {
      setTyping(false);
      setPhase("error");
      setMessages((m) => [...m, bot("Network error. Please check your connection and try again.")]);
    }
  }

  function restart() {
    started.current = false;
    nextId = 1;
    setAnswers({});
    setResult(null);
    setPhase("chat");
    setPicked([]);
    setMessages([]);
    // Re-run the greeting effect on the next tick.
    setTimeout(() => {
      started.current = true;
      const preset = NICHES.find((n) => n.slug === niche);
      if (preset) {
        setAnswers({ industry: preset.industry });
        setMessages([bot("Starting over."), bot(STEPS.location.question)]);
      } else {
        setMessages([bot("Starting over."), bot(STEPS.industry.question)]);
      }
    }, 0);
  }

  const inputDisabled = !step || step.kind === "consent" || phase !== "chat" || typing;
  const showOptions = phase === "chat" && !typing && step?.options;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-card border border-rule bg-paper shadow-[0_1px_0_var(--rule),0_12px_32px_-16px_rgba(0,0,0,0.18)] ${
        phase === "done" ? "" : "h-[560px] md:h-[680px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          <p className="text-sm font-semibold">Fit check</p>
          <p className="font-mono text-xs text-ink-2">· about 2 minutes</p>
        </div>
        {Object.keys(answers).length > (niche ? 1 : 0) && phase !== "submitting" && (
          <button type="button" onClick={restart} className="flex items-center gap-1 text-xs text-ink-2 hover:text-ink">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Start over
          </button>
        )}
      </div>

      <div ref={scroller} className={`flex-1 space-y-3 px-4 py-5 overflow-y-auto ${phase === "done" ? "max-h-[340px]" : ""}`} role="log" aria-live="polite" aria-label="Chat">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                m.role === "user" ? "rounded-br-sm bg-accent text-accent-ink" : "rounded-bl-sm bg-paper-2 text-ink"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start" aria-label="Assistant is typing">
            <span className="flex gap-1 rounded-2xl rounded-bl-sm bg-paper-2 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-2" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
          </div>
        )}

        {phase === "error" && (
          <button type="button" className="btn btn-primary" onClick={() => void submit(answers)}>
            Try again
          </button>
        )}
      </div>

      {phase === "done" && result && (
        <div ref={resultRef} className="scroll-mt-24 space-y-3 border-t border-rule px-4 py-4">
          <ul className="rounded-card border border-rule">
            {result.reasons.map((r) => (
              <li key={r.id} className="flex gap-2 border-b border-rule px-3 py-2 text-[13px] last:border-b-0">
                <span className="mt-0.5 shrink-0">
                  {r.status === "pass" ? (
                    <Check className="h-4 w-4 text-accent" aria-label="Meets" />
                  ) : r.status === "maybe" ? (
                    <Minus className="h-4 w-4 text-warn" aria-label="Needs confirmation" />
                  ) : (
                    <X className="h-4 w-4 text-bad" aria-label="Does not meet" />
                  )}
                </span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
          {result.tier !== "not-yet" && <CalendlyEmbed leadId={result.leadId} tier={result.tier} stored={result.stored} />}
          {result.tier !== "not-yet" && (
            <p className="text-[13px] text-ink-2">
              {result.stored.emailConsent
                ? `Can't find a time? Reply to the email we just sent and ${PARTNER_NAME} will call you.`
                : isTodo(PARTNER_EMAIL)
                  ? `Can't find a time? ${PARTNER_NAME} will follow up.`
                  : `Can't find a time? Email ${PARTNER_EMAIL} and ${PARTNER_NAME} will call you.`}
            </p>
          )}
        </div>
      )}

      {showOptions && step && (
        <div className="flex flex-wrap gap-2 border-t border-rule px-4 py-3">
          {step.options!.map((o) =>
            step.kind === "multi" ? (
              <button
                key={o.value}
                type="button"
                aria-pressed={picked.includes(o.value)}
                onClick={() => setPicked((p) => (p.includes(o.value) ? p.filter((v) => v !== o.value) : [...p, o.value]))}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  picked.includes(o.value) ? "border-accent bg-accent-soft text-ink" : "border-rule text-ink-2 hover:border-ink-2 hover:text-ink"
                }`}
              >
                {o.label}
              </button>
            ) : (
              <button
                key={o.value}
                type="button"
                onClick={() => choose(o.value)}
                className="rounded-full border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:text-ink"
              >
                {o.label}
              </button>
            )
          )}
          {step.kind === "multi" && (
            <button type="button" disabled={!picked.length} onClick={() => choose(picked.join(","))} className="btn btn-primary !min-h-[34px] !rounded-full !px-4 !py-1.5 text-sm disabled:opacity-40">
              Done
            </button>
          )}
        </div>
      )}

      {phase === "chat" && step?.kind === "optional" && !typing && (
        <div className="border-t border-rule px-4 pt-3">
          <button type="button" onClick={() => choose("", "Skip")} className="rounded-full border border-rule px-3 py-1.5 text-sm text-ink-2 hover:border-ink-2 hover:text-ink">
            Skip
          </button>
        </div>
      )}

      <form onSubmit={onSend} className="flex items-center gap-2 border-t border-rule p-3">
        <label htmlFor="chat-input" className="sr-only">
          Type your answer or a question
        </label>
        <input
          ref={inputRef}
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={inputDisabled}
          maxLength={600}
          autoComplete={step?.kind === "email" ? "email" : step?.kind === "name" ? "name" : step?.key === "phone" ? "tel" : "off"}
          inputMode={step?.kind === "number" ? "numeric" : step?.kind === "email" ? "email" : step?.key === "phone" ? "tel" : "text"}
          placeholder={
            phase === "done" ? "Fit check complete" : step?.kind === "consent" ? "Tap Yes or No thanks above" : step?.placeholder ?? "Type an answer or ask a question"
          }
          className="min-h-[44px] flex-1 rounded-full border border-rule bg-paper px-4 text-[15px] placeholder:text-ink-2/70 focus:border-accent focus:outline-none disabled:opacity-60"
        />
        <button type="submit" disabled={inputDisabled || !input.trim()} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-ink disabled:opacity-40">
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
        {/* Honeypot: hidden from people, filled by bots. */}
        <input type="text" name="fax" value={fax} onChange={(e) => setFax(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </form>
    </div>
  );
}

function resultMessages(tier: Tier, reasons: Reason[], firstName: string, emailed: boolean): Msg[] {
  const failing = reasons.filter((r) => r.status === "fail").map((r) => r.text.replace(/\.$/, ""));
  const open = reasons.filter((r) => r.status === "maybe");
  if (tier === "strong") {
    return [
      bot(`Thanks, ${firstName}. Based on your answers, your company meets our data partner's published minimums.`),
      bot(`Next step: a 15-minute call with ${PARTNER_NAME} to confirm details and introduce you to our data partner. Pick a time below.`),
    ];
  }
  if (tier === "possible") {
    return [
      bot(`Thanks, ${firstName}. Your company looks like a possible fit. ${open.length === 1 ? "One item needs" : "A few items need"} confirming, marked with a dash below.`),
      bot(`Next step: a 15-minute call with ${PARTNER_NAME} to go through them. Pick a time below.`),
    ];
  }
  return [
    bot(`Thanks, ${firstName}. Based on your answers, your company doesn't meet one of our data partner's published minimums today: ${failing.join("; ")}.`),
    bot(`Thresholds are set by our data partner and may change.${emailed ? ` If they do, ${PARTNER_NAME} may reach out by email.` : ""}`),
  ];
}
