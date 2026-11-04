/**
 * Site configuration. Every value here comes from the build brief, Section 1.
 * Nothing may be invented: unfilled values stay as named TODO constants and
 * trigger a visible build-time console warning (see warnMissingConfig below).
 */

const TODO = (key: string) => `TODO_${key}`;

// ---------------------------------------------------------------------------
// FILL THESE IN
// ---------------------------------------------------------------------------
export const SITE_NAME: string = "Growth Capital Opportunity";
export const DOMAIN: string = TODO("DOMAIN"); // e.g. https://example.com (no trailing slash)
export const PARTNER_NAME: string = "Nate Llorens";
export const PARTNER_COMPANY: string = TODO("PARTNER_COMPANY");
export const PARTNER_EMAIL: string = TODO("PARTNER_EMAIL");
export const MAILING_ADDRESS: string = TODO("PHYSICAL_MAILING_ADDRESS"); // required for CAN-SPAM
export const CALENDLY_URL: string = "https://calendly.com/admin-opslyautomations/30min";
export const PODCAST_SHOW_URL: string = TODO("PODCAST_SHOW_URL");
export const PARTNER_BIO: string = TODO("PARTNER_BIO"); // 2 sentences, shown in DisclosurePanel
export const PARTNER_PHOTO: string | null = null; // e.g. "/partner.jpg" in /public; null shows a placeholder

/** Accent colour. Brief default: deep green #1F5F4A. Also update --accent in app/globals.css. */
export const BRAND_PRIMARY_HEX = "#1F5F4A";

/**
 * Which Calendly invitee question (a1, a2, …) receives each qualifier value.
 * Match these to the custom questions on your Calendly event type, in order.
 */
export const CALENDLY_QUESTION_MAP = {
  company: "a1", // "Company and website"
  deskEmployees: "a2",
  yearsOfRecords: "a3",
  tier: "a4", // includes niche + leadId for reference
} as const;

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------
export const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL ?? "";
export const ELIGIBILITY_LAST_VERIFIED = process.env.ELIGIBILITY_LAST_VERIFIED || TODO("ELIGIBILITY_LAST_VERIFIED");

/** Safe absolute base URL for metadata even while DOMAIN is still TODO. */
export const BASE_URL = DOMAIN.startsWith("http") ? DOMAIN : "http://localhost:3000";

export const DISCLOSURE = `${SITE_NAME} is run by ${PARTNER_COMPANY}, an independent referral partner of an AI training-data company (our data partner). We are compensated by our data partner when a referred company completes a data licensing agreement. Your company pays us nothing. Our data partner makes all offers and decisions.`;

/** Bump whenever consent wording changes; stored with every lead. */
export const CONSENT_VERSION = "2026-11-04.v1";
export const EMAIL_CONSENT_TEXT = `I agree to receive email from ${PARTNER_COMPANY} about this inquiry. I can unsubscribe at any time.`;
export const SMS_CONSENT_TEXT = `I agree to receive text messages from ${PARTNER_COMPANY} about this inquiry. Msg & data rates may apply. Reply STOP to opt out.`;

export const INDICATIVE_RANGE =
  "Our data partner's published range is $100K–$5M, indicative. Indicative only. Our data partner sets a fixed offer after reviewing your systems, history, and data volume.";

export function isTodo(value: string | null | undefined): boolean {
  return !value || value.startsWith("TODO_");
}

let warned = false;
export function warnMissingConfig() {
  if (warned || typeof window !== "undefined") return;
  warned = true;
  const checks: Record<string, string> = {
    SITE_NAME,
    DOMAIN,
    PARTNER_NAME,
    PARTNER_COMPANY,
    PARTNER_EMAIL,
    MAILING_ADDRESS,
    CALENDLY_URL,
    PODCAST_SHOW_URL,
    PARTNER_BIO,
    ELIGIBILITY_LAST_VERIFIED,
    LEAD_WEBHOOK_URL: LEAD_WEBHOOK_URL || "TODO_LEAD_WEBHOOK_URL",
    LEAD_SIGNING_SECRET: process.env.LEAD_SIGNING_SECRET || "TODO_LEAD_SIGNING_SECRET",
  };
  const missing = Object.entries(checks)
    .filter(([, v]) => isTodo(v))
    .map(([k]) => k);
  if (missing.length) {
    console.warn(
      `\n⚠️  [site config] ${missing.length} value(s) still TODO: ${missing.join(", ")}\n   Fill /config/site.ts and env vars before launch.\n`
    );
  }
}
