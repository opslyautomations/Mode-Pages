// /config/eligibility.ts
// Source: data.mode.inc, accessed Oct–Nov 2026. VERIFY with Mode before scaling.
// Other published versions exist (ai.mode.inc: 10/15/50; press release: 6/10/20).
// Thresholds live ONLY in this file.

export const DESK_MINIMUMS = {
  legal: 6,
  accounting_finance: 10,
  medical: 10,
  other: 30, // marketing agencies, home services, other, nonprofit
} as const;

export type EligibilityKey = keyof typeof DESK_MINIMUMS;

export const ELIGIBILITY_LABELS: Record<EligibilityKey, string> = {
  legal: "Legal",
  accounting_finance: "Accounting & finance",
  medical: "Medical & dental",
  other: "Agencies, operators & other",
};

export const MIN_YEARS = 3;
export const STRONG_YEARS = 5;
export const LAST_VERIFIED = process.env.ELIGIBILITY_LAST_VERIFIED ?? "TODO";
