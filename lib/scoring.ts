import { DESK_MINIMUMS, MIN_YEARS, STRONG_YEARS, type EligibilityKey } from "@/config/eligibility";
import type { Answers } from "./lead-schema";

export type Tier = "strong" | "possible" | "not-yet";
export type CheckStatus = "pass" | "maybe" | "fail";
export type Reason = { id: string; status: CheckStatus; text: string };

export type ScoreResult = {
  tier: Tier;
  reasons: Reason[];
  priority: number;
  manualReview: boolean;
  scoringKey: EligibilityKey;
  deskMinimum: number;
};

export const TIERS: Tier[] = ["strong", "possible", "not-yet"];

export function industryToScoringKey(industry: Answers["industry"]): EligibilityKey {
  switch (industry) {
    case "legal":
      return "legal";
    case "accounting":
      return "accounting_finance";
    case "medical":
      return "medical";
    default:
      return "other";
  }
}

const YEARS_VALUE: Record<Answers["years"], number> = { lt3: 2, "3_4": 3.5, "5_9": 7, "10_plus": 10 };
const YEARS_MIN: Record<Answers["years"], number> = { lt3: 0, "3_4": 3, "5_9": 5, "10_plus": 10 };

export function score(a: Answers): ScoreResult {
  const scoringKey = industryToScoringKey(a.industry);
  const deskMinimum = DESK_MINIMUMS[scoringKey];
  const reasons: Reason[] = [];
  let manualReview = false;

  // 1. Location
  if (a.location === "us") {
    reasons.push({ id: "location", status: "pass", text: "Team based in the United States." });
  } else if (a.location === "ca_uk_au") {
    reasons.push({ id: "location", status: "maybe", text: "Team based in Canada, the UK, or Australia. Our data partner must confirm." });
  } else {
    reasons.push({
      id: "location",
      status: "fail",
      text: "Most of your team is based in the EU or another region outside our data partner's current program.",
    });
  }

  // 2. Desk employees vs minimum
  if (a.deskEmployees >= deskMinimum) {
    reasons.push({
      id: "desk",
      status: "pass",
      text: `${a.deskEmployees} desk employees meets the published minimum of ${deskMinimum}.`,
    });
  } else {
    reasons.push({
      id: "desk",
      status: "fail",
      text: `${a.deskEmployees} desk employees is below the published minimum of ${deskMinimum} for your category.`,
    });
  }

  // 3. Years of records
  const minYears = YEARS_MIN[a.years];
  if (minYears < MIN_YEARS) {
    reasons.push({ id: "years", status: "fail", text: `Fewer than ${MIN_YEARS} years of digital records.` });
  } else if (minYears < STRONG_YEARS) {
    reasons.push({ id: "years", status: "maybe", text: "3–4 years of records meets the minimum; more history is stronger." });
  } else {
    reasons.push({ id: "years", status: "pass", text: `${STRONG_YEARS}+ years of digital records.` });
  }

  // 4. Systems
  const systemCount = a.systems.length;
  if (systemCount >= 2) {
    reasons.push({ id: "systems", status: "pass", text: `${systemCount} record systems in use.` });
  } else {
    reasons.push({ id: "systems", status: "fail", text: "Fewer than two record systems selected." });
  }

  // 5. Ownership
  if (a.ownership === "own") {
    reasons.push({ id: "ownership", status: "pass", text: "Records live in accounts your company owns." });
  } else if (a.ownership === "mixed") {
    reasons.push({
      id: "ownership",
      status: "maybe",
      text: "Some records sit in client-owned accounts. Only what you own can be in scope.",
    });
  } else {
    reasons.push({
      id: "ownership",
      status: "maybe",
      text: "Most records sit in client, parent, or franchisor accounts. Ownership must be confirmed before anything is scoped.",
    });
  }

  // 6. Prior contact
  if (a.priorContact === "buyer" || a.priorContact === "partner") {
    manualReview = true;
    reasons.push({
      id: "prior",
      status: "maybe",
      text: "You've already been in touch about this. We'll check your registration status first.",
    });
  } else if (a.priorContact === "unsure") {
    manualReview = true;
    reasons.push({ id: "prior", status: "pass", text: "We'll quickly check whether you're already registered." });
  } else {
    reasons.push({ id: "prior", status: "pass", text: "No prior registration." });
  }

  const tier: Tier = reasons.some((r) => r.status === "fail")
    ? "not-yet"
    : reasons.some((r) => r.status === "maybe")
      ? "possible"
      : "strong";

  // Internal sort score only. Never shown to visitors.
  let priority = a.deskEmployees * YEARS_VALUE[a.years];
  if (scoringKey === "legal" || scoringKey === "accounting_finance") priority *= 1.5;
  if (a.location === "us") priority *= 1.2;
  priority = Math.round(priority * 10) / 10;

  return { tier, reasons, priority, manualReview, scoringKey, deskMinimum };
}
