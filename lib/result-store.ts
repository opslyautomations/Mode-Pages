import type { Reason, Tier } from "./scoring";

/**
 * Hands the qualifier result to /result and /book within the same tab.
 * sessionStorage is a convenience only: every read is guarded, and the pages
 * still render (without prefill) if it is empty or blocked.
 */
export type StoredResult = {
  leadId: string;
  tier: Tier;
  reasons: Reason[];
  manualReview: boolean;
  emailSent: boolean;
  emailConsent: boolean;
  niche: string;
  industry: string;
  episode?: string;
  prefill: {
    name: string;
    email: string;
    company: string;
    website: string;
    deskEmployees: number;
    years: string;
  };
};

const KEY = "qualifier_result";

export function saveResult(r: StoredResult) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    /* storage unavailable */
  }
}

export function loadResult(leadId?: string | null): StoredResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as StoredResult;
    if (leadId && r.leadId !== leadId) return null;
    return r;
  } catch {
    return null;
  }
}
