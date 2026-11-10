/**
 * The chat qualifier's script. Shared by the client (what to ask next) and
 * /api/chat (what a free-text reply may resolve to). The chat collects exactly
 * the same answers as the old multi-step form, and /api/qualify still scores
 * them server-side: Claude interprets and answers questions, it never scores.
 */
import { EMAIL_CONSENT_TEXT, PARTNER_NAME, SMS_CONSENT_TEXT } from "@/config/site";
import { INDUSTRIES, LOCATIONS, OWNERSHIP, PRIOR_CONTACT, ROLES, SYSTEM_OPTIONS, YEARS } from "./lead-schema";

export type Option = { readonly value: string; readonly label: string };

export type StepKind =
  | "choice" // pick one option
  | "multi" // pick several options, then "Done"
  | "number" // whole number
  | "name" // first + last name
  | "email"
  | "text" // required free text
  | "optional" // free text that can be skipped
  | "consent"; // yes / no buttons only, never interpreted by the model

export const STEP_KEYS = [
  "industry",
  "location",
  "deskEmployees",
  "years",
  "systems",
  "ownership",
  "priorContact",
  "name",
  "email",
  "company",
  "website",
  "role",
  "phone",
  "emailConsent",
  "smsConsent",
] as const;
export type StepKey = (typeof STEP_KEYS)[number];

export type ChatStep = {
  key: StepKey;
  kind: StepKind;
  question: string;
  options?: readonly Option[];
  placeholder?: string;
};

const YES_NO: readonly Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No thanks" },
];

export const STEPS: Record<StepKey, ChatStep> = {
  industry: { key: "industry", kind: "choice", question: "First, what kind of business do you run?", options: INDUSTRIES },
  location: { key: "location", kind: "choice", question: "Where is most of your team based?", options: LOCATIONS },
  deskEmployees: {
    key: "deskEmployees",
    kind: "number",
    question: "How many full-time desk employees do you have? People who work mostly on a computer: office, admin, professional staff.",
    placeholder: "e.g. 25",
  },
  years: { key: "years", kind: "choice", question: "How many years of digital records does the company have (email, files, CRM, billing)?", options: YEARS },
  systems: {
    key: "systems",
    kind: "multi",
    question: "Which systems hold those records? Pick all that apply, then tap Done.",
    options: SYSTEM_OPTIONS,
  },
  ownership: { key: "ownership", kind: "choice", question: "Whose accounts are those records in?", options: OWNERSHIP },
  priorContact: {
    key: "priorContact",
    kind: "choice",
    question: "Have you looked into licensing your company's data before? Any answer is fine.",
    options: PRIOR_CONTACT,
  },
  name: { key: "name", kind: "name", question: `Thanks. A few details so ${PARTNER_NAME} can prepare for your call. What's your full name?`, placeholder: "First and last name" },
  email: { key: "email", kind: "email", question: "What's your work email?", placeholder: "you@company.com" },
  company: { key: "company", kind: "text", question: "And the company name?", placeholder: "Company name" },
  website: { key: "website", kind: "optional", question: "Company website? You can skip this.", placeholder: "company.com" },
  role: { key: "role", kind: "choice", question: "What's your role?", options: ROLES },
  phone: { key: "phone", kind: "optional", question: "Best phone number, in case the call needs rescheduling? Optional.", placeholder: "(555) 555-5555" },
  emailConsent: { key: "emailConsent", kind: "consent", question: `Can we email you about this inquiry? ${EMAIL_CONSENT_TEXT}`, options: YES_NO },
  smsConsent: { key: "smsConsent", kind: "consent", question: `Can we also text you? ${SMS_CONSENT_TEXT}`, options: YES_NO },
};

/** Lenient local matching so plain answers ("25", "Legal", "us") never need the model. */
export function localParse(step: ChatStep, raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  switch (step.kind) {
    case "number": {
      const m = text.replace(/,/g, "").match(/^\D{0,20}?(\d{1,7})\D{0,30}$/);
      return m ? String(parseInt(m[1], 10)) : null;
    }
    case "choice":
    case "consent": {
      const opt = step.options?.find((o) => o.label.toLowerCase() === lower || o.value.toLowerCase() === lower);
      return opt?.value ?? null;
    }
    case "multi": {
      const parts = lower.split(/\s*(?:,|;|\band\b|&|\/)\s*/).filter(Boolean);
      const vals = parts.map((p) => step.options?.find((o) => o.label.toLowerCase() === p || o.value === p)?.value);
      return vals.length && vals.every(Boolean) ? Array.from(new Set(vals)).join(",") : null;
    }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text) ? text : null;
    case "name":
      return looksLikeQuestion(text) ? null : text.split(/\s+/).length >= 2 ? text : null;
    case "text":
    case "optional":
      return looksLikeQuestion(text) ? null : text;
  }
}

export function looksLikeQuestion(text: string): boolean {
  return /\?\s*$/.test(text) || /^(what|how|why|who|when|where|is|are|do|does|can|will|would|should)\b/i.test(text.trim());
}

/** Validates a value (from the model or local parsing) against the step. Returns the normalised value or null. */
export function validateAnswer(step: ChatStep, value: string | null | undefined): string | null {
  if (value == null) return null;
  const v = String(value).trim();
  if (!v) return null;
  switch (step.kind) {
    case "choice":
    case "consent":
      return step.options?.some((o) => o.value === v) ? v : null;
    case "multi": {
      const vals = v.split(",").map((s) => s.trim()).filter(Boolean);
      return vals.length && vals.every((x) => step.options?.some((o) => o.value === x)) ? Array.from(new Set(vals)).join(",") : null;
    }
    case "number":
      return /^\d{1,7}$/.test(v) ? String(parseInt(v, 10)) : null;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v.slice(0, 200) : null;
    case "name":
      return v.split(/\s+/).length >= 2 ? v.slice(0, 160) : null;
    case "text":
    case "optional":
      return v.slice(0, 200);
  }
}
