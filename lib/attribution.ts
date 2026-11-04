/**
 * First-touch attribution. Captured in middleware.ts on the first request and
 * stored in the `ref_attrib` cookie (90 days, SameSite=Lax). First touch wins:
 * the cookie is never overwritten. Sent with every lead as proof of first referral.
 */

export const ATTRIB_COOKIE = "ref_attrib";
export const ATTRIB_MAX_AGE = 60 * 60 * 24 * 90;

export type Attribution = {
  src?: string;
  niche?: string;
  ep?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landingPath?: string;
  firstSeen?: string;
};

const KEYS = [
  "src",
  "niche",
  "ep",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

export function buildAttribution(url: URL, referrer: string | null): Attribution {
  const a: Attribution = {};
  for (const k of KEYS) {
    const v = url.searchParams.get(k);
    if (v) a[k] = v.slice(0, 200);
  }
  if (referrer) a.referrer = referrer.slice(0, 300);
  a.landingPath = url.pathname.slice(0, 200);
  a.firstSeen = new Date().toISOString();
  return a;
}

/** Plain JSON: Next's cookie API URL-encodes the value itself. */
export function encodeAttribution(a: Attribution): string {
  return JSON.stringify(a);
}

/** Accepts the decoded value (server cookie API) or the raw header value (document.cookie). */
export function decodeAttribution(raw: string | null | undefined): Attribution {
  if (!raw) return {};
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const v = JSON.parse(candidate);
      if (v && typeof v === "object") return v as Attribution;
    } catch {
      /* try next */
    }
  }
  return {};
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Client-side read (for Calendly UTM params). */
export function readAttributionClient(): Attribution {
  if (typeof document === "undefined") return {};
  const match = document.cookie.split("; ").find((c) => c.startsWith(ATTRIB_COOKIE + "="));
  return decodeAttribution(match?.slice(ATTRIB_COOKIE.length + 1));
}
