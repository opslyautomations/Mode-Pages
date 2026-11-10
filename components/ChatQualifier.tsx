"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, CalendarCheck, RotateCcw } from "lucide-react";
import { PARTNER_NAME, SITE_NAME } from "@/config/site";
import { NICHES } from "@/content/niches";
import { readAttributionClient } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import { CalendlyEmbed } from "./CalendlyEmbed";

type Msg = { id: string; role: "bot" | "user"; text: string };
type Saved = { messages: Msg[]; sessionId?: string; leadId?: string };

const STORE_KEY = "chat_session_v1";
const SUGGESTIONS = ["How does this work?", "Do I qualify?", "Do you need our passwords?", "How long does it take?"];

const uid = () => Math.random().toString(36).slice(2, 10);
const bot = (text: string): Msg => ({ id: uid(), role: "bot", text });
const user = (text: string): Msg => ({ id: uid(), role: "user", text });

function greeting(nicheLabel?: string): Msg[] {
  return [
    bot(
      `Hi, I'm the ${SITE_NAME} assistant. I can explain how company data licensing works and check whether your ${
        nicheLabel ? nicheLabel.toLowerCase().replace(/s$/, "") : "company"
      } may qualify. If it does, you can book a 15-minute call with ${PARTNER_NAME} right here.`
    ),
    bot("What would you like to know? Or tell me a bit about your company to get started."),
  ];
}

function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function save(s: Saved) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Free-form chat with the GoHighLevel qualification agent (via /api/chat).
 * When the agent marks the visitor as qualified, the server signs a lead id
 * and the Calendly booking calendar opens below the conversation.
 */
export function ChatQualifier() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string>();
  const [leadId, setLeadId] = useState<string>();
  const [niche, setNiche] = useState<string>();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentContext = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = readAttributionClient();
    const preset = NICHES.find((n) => n.slug === (params.get("niche") ?? a.niche));
    setNiche(preset?.slug);
    const saved = load();
    if (saved?.messages?.length) {
      setMessages(saved.messages);
      setSessionId(saved.sessionId);
      setLeadId(saved.leadId);
      sentContext.current = !!saved.sessionId;
      if (saved.leadId) setShowCalendar(true);
    } else {
      setMessages(greeting(preset?.label));
    }
  }, []);

  useEffect(() => {
    if (messages.length) save({ messages, sessionId, leadId });
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sessionId, leadId, typing]);

  useEffect(() => {
    if (showCalendar) bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showCalendar]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || typing) return;
    setInput("");
    setMessages((m) => [...m, user(message)]);
    setTyping(true);
    if (!sessionId) track("qualifier_start", { mode: "chat" });

    // On the first message, tell the agent where the visitor came from (the visitor doesn't see this).
    let outgoing = message;
    if (!sentContext.current) {
      const label = NICHES.find((n) => n.slug === niche)?.label;
      if (label) outgoing = `[Context: visitor arrived from our ${label.toLowerCase()} podcast link.]\n${message}`;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outgoing, sessionId, leadId, niche }),
      });
      const data = (await res.json()) as { reply?: string; sessionId?: string; qualified?: boolean; leadId?: string; error?: string };
      if (!res.ok || !data.reply) {
        setMessages((m) => [...m, bot(data.error ?? "Something went wrong. Please try again.")]);
      } else {
        sentContext.current = true;
        setSessionId(data.sessionId);
        setMessages((m) => [...m, bot(data.reply!)]);
        if (data.qualified && data.leadId && !leadId) {
          setLeadId(data.leadId);
          track("qualifier_complete", { tier: "strong", niche: niche ?? "", mode: "chat" });
          setMessages((m) => [...m, bot(`Great news: you look like a fit. Pick a time below to book your 15-minute call with ${PARTNER_NAME}.`)]);
          setShowCalendar(true);
        }
      }
    } catch {
      setMessages((m) => [...m, bot("I couldn't reach the server. Please check your connection and try again.")]);
    }
    setTyping(false);
    inputRef.current?.focus();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function restart() {
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    sentContext.current = false;
    setSessionId(undefined);
    setLeadId(undefined);
    setShowCalendar(false);
    setMessages(greeting(NICHES.find((n) => n.slug === niche)?.label));
  }

  const userHasSpoken = messages.some((m) => m.role === "user");

  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-rule bg-paper shadow-[0_1px_0_var(--rule),0_12px_32px_-16px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          <p className="text-sm font-semibold">Fit check</p>
          <p className="font-mono text-xs text-ink-2">· chat with our assistant</p>
        </div>
        {userHasSpoken && !typing && (
          <button type="button" onClick={restart} className="flex items-center gap-1 text-xs text-ink-2 hover:text-ink">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Start over
          </button>
        )}
      </div>

      <div
        ref={scroller}
        className={`space-y-3 overflow-y-auto px-4 py-5 ${showCalendar ? "max-h-[360px]" : "h-[420px] md:h-[520px]"}`}
        role="log"
        aria-live="polite"
        aria-label="Chat"
      >
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
      </div>

      {showCalendar && leadId && (
        <div ref={bookingRef} className="scroll-mt-24 space-y-3 border-t border-rule px-4 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck className="h-4 w-4 text-accent" aria-hidden="true" /> Book your call with {PARTNER_NAME}
          </p>
          <CalendlyEmbed leadId={leadId} tier="strong" stored={null} />
        </div>
      )}

      {!userHasSpoken && !typing && (
        <div className="flex flex-wrap gap-2 border-t border-rule px-4 py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-rule p-3">
        <label htmlFor="chat-input" className="sr-only">
          Message the assistant
        </label>
        <input
          ref={inputRef}
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={typing}
          maxLength={1500}
          autoComplete="off"
          placeholder={typing ? "Assistant is typing…" : "Type a message"}
          className="min-h-[44px] flex-1 rounded-full border border-rule bg-paper px-4 text-[15px] placeholder:text-ink-2/70 focus:border-accent focus:outline-none disabled:opacity-60"
        />
        <button type="submit" disabled={typing || !input.trim()} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-ink disabled:opacity-40">
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
