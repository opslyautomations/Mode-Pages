import {
  DISCLOSURE,
  LEAD_WEBHOOK_URL,
  MAILING_ADDRESS,
  PARTNER_COMPANY,
  PARTNER_EMAIL,
  PARTNER_NAME,
  SITE_NAME,
  isTodo,
} from "@/config/site";
import type { Tier } from "./scoring";

/** POST JSON to the CRM webhook, retrying once. Returns true on success. */
export async function postToWebhook(payload: unknown): Promise<boolean> {
  if (!LEAD_WEBHOOK_URL) {
    console.warn("[webhook] LEAD_WEBHOOK_URL not set; lead not forwarded.", JSON.stringify(payload).slice(0, 500));
    return false;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return true;
      console.error(`[webhook] attempt ${attempt} failed with ${res.status}`);
    } catch (err) {
      console.error(`[webhook] attempt ${attempt} error`, err);
    }
  }
  return false;
}

async function sendEmail(to: string, subject: string, text: string, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || (isTodo(PARTNER_EMAIL) ? "" : `${SITE_NAME} <${PARTNER_EMAIL}>`);
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

/** Fallback when the webhook fails twice: email the raw lead to the partner. */
export async function sendFallbackEmail(payload: Record<string, unknown>): Promise<boolean> {
  if (isTodo(PARTNER_EMAIL)) return false;
  return sendEmail(
    PARTNER_EMAIL,
    `[Webhook failed] New ${payload.tier} lead: ${(payload.contact as { company?: string })?.company ?? ""}`,
    JSON.stringify(payload, null, 2)
  );
}

/** Builds the follow-up email (also included in the webhook payload for the CRM). */
export function buildFollowUpEmail(firstName: string, tier: Tier): { subject: string; text: string } {
  const next =
    tier === "not-yet"
      ? "Based on your answers, your company doesn't meet one of our data partner's published minimums today. Thresholds are set by our data partner and may change."
      : `The next step is a 15-minute call with ${PARTNER_NAME} to confirm details and introduce you to our data partner. If you haven't booked a time yet, reply to this email and ${PARTNER_NAME} will call you.`;
  const text = [
    `Hi ${firstName},`,
    "",
    `Thanks for checking your fit on ${SITE_NAME}.`,
    "",
    next,
    "",
    "Our data partner generally expects about three months from the first conversation to payment. A written agreement fixes the amount, payment schedule, systems, date ranges, rights, and any exclusivity before any export.",
    "",
    PARTNER_NAME,
    PARTNER_COMPANY,
    "",
    "—",
    DISCLOSURE,
    "",
    MAILING_ADDRESS,
    "To stop receiving these emails, reply with \"unsubscribe\".",
  ].join("\n");
  return { subject: `Your ${SITE_NAME} fit check`, text };
}

export async function sendFollowUpEmail(to: string, firstName: string, tier: Tier): Promise<boolean> {
  const { subject, text } = buildFollowUpEmail(firstName, tier);
  return sendEmail(to, subject, text, isTodo(PARTNER_EMAIL) ? undefined : PARTNER_EMAIL);
}
