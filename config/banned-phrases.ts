/**
 * Phrases that must never appear in site copy (brief Section 2B / 12).
 * Enforced by tests/unit/banned-phrases.test.ts, which scans /content, /app,
 * /components and /lib. This file is excluded from the scan.
 */
export const BANNED_PHRASES = [
  "guaranteed",
  "you will receive",
  "free money",
  "equity",
  "investment",
  "investors",
  "sell your company data",
  "sell your clients' data",
  "sell your clients’ data",
  "fully compliant",
  "hipaa compliant",
  "privilege-safe",
  "before it goes to waste",
  "limited time",
  "spots filling up",
  "sell law firm data",
  "your data will expire",
] as const;

/** Domains the site must never link to, embed, or redirect to (brief 7E). */
export const FORBIDDEN_DOMAINS = ["mode.inc", "m0de.ai", "bizbuydata.com"] as const;
