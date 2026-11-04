"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, X } from "lucide-react";
import { DISCLOSURE, PARTNER_EMAIL, PARTNER_NAME, isTodo } from "@/config/site";
import { loadResult, type StoredResult } from "@/lib/result-store";
import type { Tier } from "@/lib/scoring";
import { CalendlyEmbed } from "./CalendlyEmbed";

const HEADLINES: Record<Tier, string> = {
  strong: "Your firm meets every published minimum.",
  possible: "You're close. One or two items need our data partner to confirm.",
  "not-yet": "Not a fit yet.",
};

function ReasonIcon({ status }: { status: string }) {
  if (status === "pass") return <Check className="h-4 w-4 text-accent" aria-label="Meets" />;
  if (status === "maybe") return <Minus className="h-4 w-4 text-warn" aria-label="Needs confirmation" />;
  return <X className="h-4 w-4 text-bad" aria-label="Does not meet" />;
}

/**
 * Result screen. `verifiedLeadId` is only set when the server verified the
 * signed lead token for this tier; without it no calendar is shown.
 */
export function ResultView({ tier, verifiedLeadId }: { tier: Tier; verifiedLeadId: string | null }) {
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notifyState, setNotifyState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    setStored(loadResult(verifiedLeadId));
    setLoaded(true);
  }, [verifiedLeadId]);

  const reasons = stored?.reasons ?? [];
  const canBook = !!verifiedLeadId && (tier === "strong" || tier === "possible");
  const emailFollowUp = stored?.emailConsent;
  const contactLine = emailFollowUp
    ? `Reply to the email we just sent and ${PARTNER_NAME} will call you.`
    : isTodo(PARTNER_EMAIL)
      ? `Contact ${PARTNER_NAME} and we'll set up a call.`
      : `Email ${PARTNER_EMAIL} and ${PARTNER_NAME} will call you.`;

  async function optIn() {
    if (!verifiedLeadId) return;
    setNotifyState("sending");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: verifiedLeadId }),
      });
      setNotifyState(res.ok ? "done" : "error");
    } catch {
      setNotifyState("error");
    }
  }

  const failing = reasons.filter((r) => r.status === "fail");
  const uncertain = reasons.filter((r) => r.status === "maybe");
  const isHomeServicesLowDesk = stored?.industry === "home_services" && failing.some((r) => r.id === "desk");

  return (
    <div aria-live="polite">
      <p className="eyebrow mb-4">Your fit result</p>
      <h1 className="h1">{HEADLINES[tier]}</h1>

      {tier === "not-yet" && failing.length > 0 && (
        <p className="mt-6 max-w-measure text-lg text-ink-2">
          Based on your answers, {failing.length === 1 ? "one published minimum isn't" : "some published minimums aren't"} met today:{" "}
          {failing.map((r) => r.text.replace(/\.$/, "")).join("; ")}.
        </p>
      )}
      {tier === "possible" && uncertain.length > 0 && (
        <p className="mt-6 max-w-measure text-lg text-ink-2">Our data partner will need to confirm the items marked with a dash below.</p>
      )}

      {reasons.length > 0 && (
        <ul className="mt-8 max-w-2xl border-t border-rule">
          {reasons.map((r) => (
            <li key={r.id} className="flex gap-3 border-b border-rule py-3 text-[15px]">
              <span className="mt-1 shrink-0">
                <ReasonIcon status={r.status} />
              </span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      )}
      {loaded && reasons.length === 0 && (
        <p className="mt-6 max-w-measure text-ink-2">
          Your detailed checklist isn&apos;t available in this browser tab.{" "}
          <Link href="/qualify" className="link">
            Run the 90-second check again
          </Link>{" "}
          to see it.
        </p>
      )}

      {stored?.manualReview && (
        <p className="mt-6 max-w-measure rounded-card border border-rule bg-paper-2 p-4 text-[15px]">
          Because you&apos;ve already been in touch about this, {PARTNER_NAME} will check whether you&apos;re already registered before anything else.
        </p>
      )}

      {/* Next step */}
      <div className="mt-12 border-t border-rule pt-10">
        {tier === "strong" && (
          <p className="max-w-measure text-lg">
            Next step: a 15-minute call with {PARTNER_NAME} to confirm details and introduce you to our data partner. Our data partner then provides an estimate and a
            14-day nonbinding letter of intent.
          </p>
        )}
        {tier === "possible" && (
          <p className="max-w-measure text-lg">
            Next step: a 15-minute call with {PARTNER_NAME} to go through the open items. If they check out, {PARTNER_NAME} introduces you to
            our data partner for an estimate and a 14-day nonbinding letter of intent.
          </p>
        )}

        {canBook && (
          <>
            <div className="mt-8">
              {loaded ? (
                <CalendlyEmbed leadId={verifiedLeadId!} tier={tier} stored={stored} />
              ) : (
                <div className="skeleton h-[700px] rounded-card" aria-hidden="true" />
              )}
            </div>
            <p className="mt-4 text-[15px] text-ink-2">
              {tier === "strong" ? `Can't find a time? ${contactLine}` : `Or: ${contactLine}`}
            </p>
          </>
        )}

        {(tier === "strong" || tier === "possible") && !verifiedLeadId && (
          <p className="max-w-measure text-ink-2">
            To book a call, complete the{" "}
            <Link href="/qualify" className="link">
              90-second fit check
            </Link>{" "}
            first.
          </p>
        )}

        {tier === "not-yet" && (
          <div className="max-w-measure space-y-4">
            {isHomeServicesLowDesk && <p>Most home-service companies are field-heavy, so this is common.</p>}
            <p>Thresholds are set by our data partner and may change. Want us to tell you if they do?</p>
            {verifiedLeadId && emailFollowUp ? (
              notifyState === "done" ? (
                <p className="font-medium text-accent">Done. We&apos;ll email you if the thresholds change.</p>
              ) : (
                <button type="button" className="btn btn-primary" onClick={optIn} disabled={notifyState === "sending"}>
                  {notifyState === "sending" ? "Saving…" : "Yes, tell me if thresholds change"}
                </button>
              )
            ) : (
              <p className="text-sm text-ink-2">
                This option is available to visitors who agreed to email follow-up in the fit check.
              </p>
            )}
            {notifyState === "error" && <p className="text-sm text-bad">That didn&apos;t go through. Please try again.</p>}
          </div>
        )}
      </div>

      <div className="mt-12 max-w-measure border-t border-rule pt-6">
        <p className="eyebrow mb-2">Disclosure</p>
        <p className="text-sm text-ink-2" data-disclosure>
          {DISCLOSURE}
        </p>
      </div>
    </div>
  );
}
