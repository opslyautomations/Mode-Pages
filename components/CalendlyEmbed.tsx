"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_ID = "calendly-widget-js";
const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
import { CALENDLY_QUESTION_MAP, CALENDLY_URL, isTodo } from "@/config/site";
import { readAttributionClient } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import type { StoredResult } from "@/lib/result-store";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: { name?: string; email?: string; customAnswers?: Record<string, string> };
        utm?: { utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string };
      }) => void;
    };
  }
}

/**
 * Calendly inline widget. Only rendered for strong/possible tiers with a
 * server-verified leadId. Prefilled with qualifier answers; reports bookings
 * back to /api/booked.
 */
export function CalendlyEmbed({ leadId, tier, stored }: { leadId: string; tier: string; stored: StoredResult | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [booked, setBooked] = useState(false);
  const inited = useRef(false);

  const init = useCallback(() => {
    if (inited.current || !ref.current || !window.Calendly || isTodo(CALENDLY_URL)) return;
    inited.current = true;
    const a = readAttributionClient();
    const p = stored?.prefill;
    const customAnswers: Record<string, string> = {};
    if (p) {
      customAnswers[CALENDLY_QUESTION_MAP.company] = [p.company, p.website].filter(Boolean).join(" · ");
      customAnswers[CALENDLY_QUESTION_MAP.deskEmployees] = String(p.deskEmployees);
      customAnswers[CALENDLY_QUESTION_MAP.yearsOfRecords] = p.years;
    }
    customAnswers[CALENDLY_QUESTION_MAP.tier] = [tier, stored?.niche || stored?.industry, leadId].filter(Boolean).join(" · ");

    const ep = stored?.episode ?? a.ep;
    window.Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: ref.current,
      prefill: p ? { name: p.name, email: p.email, customAnswers } : { customAnswers },
      utm: {
        utmSource: a.src ?? a.utm_source ?? "direct",
        utmMedium: stored?.niche || a.niche || "general",
        utmCampaign: ep ? `ep-${ep}` : "ep-none",
        utmContent: leadId,
      },
    });
  }, [leadId, tier, stored]);

  useEffect(() => {
    track("booking_view", { tier });
    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string; payload?: { event?: { uri?: string }; invitee?: { uri?: string } } };
      if (data?.event === "calendly.event_type_viewed") setReady(true);
      if (data?.event === "calendly.event_scheduled") {
        setBooked(true);
        track("booking_complete", { tier });
        fetch("/api/booked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId,
            eventUri: data.payload?.event?.uri,
            inviteeUri: data.payload?.invitee?.uri,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    }
    window.addEventListener("message", onMessage);

    // Load Calendly's widget script once (only on pages that render this component),
    // then initialise as soon as window.Calendly exists.
    let poll: ReturnType<typeof setInterval> | undefined;
    if (!isTodo(CALENDLY_URL)) {
      if (window.Calendly) {
        init();
      } else {
        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement("script");
          script.id = SCRIPT_ID;
          script.src = SCRIPT_SRC;
          script.async = true;
          document.body.appendChild(script);
        }
        script.addEventListener("load", init);
        let tries = 0;
        poll = setInterval(() => {
          if (window.Calendly || ++tries > 100) {
            clearInterval(poll);
            init();
          }
        }, 200);
      }
    }
    return () => {
      window.removeEventListener("message", onMessage);
      if (poll) clearInterval(poll);
    };
  }, [init, leadId, tier]);

  if (isTodo(CALENDLY_URL)) {
    return (
      <p className="rounded-card border border-dashed border-rule p-6 font-mono text-sm text-ink-2">
        TODO_CALENDLY_EVENT_URL: set CALENDLY_URL in /config/site.ts to show the booking calendar.
      </p>
    );
  }

  return (
    <div>
      <div className="relative min-h-[700px] overflow-hidden rounded-card border border-rule">
        {!ready && (
          <div className="absolute inset-0 grid gap-4 p-6" aria-hidden="true">
            <div className="skeleton h-8 w-1/2 rounded-card" />
            <div className="skeleton h-4 w-1/3 rounded-card" />
            <div className="skeleton h-[520px] w-full rounded-card" />
          </div>
        )}
        <div ref={ref} className="calendly-embed relative w-full" style={{ minHeight: 700 }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {booked ? "Your call is booked. Check your email for the calendar invite." : ""}
      </p>
    </div>
  );
}
