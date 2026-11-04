import { z } from "zod";

export const INDUSTRIES = [
  { value: "legal", label: "Legal" },
  { value: "accounting", label: "Accounting / finance" },
  { value: "medical", label: "Medical / dental" },
  { value: "agency", label: "Marketing / creative agency" },
  { value: "home_services", label: "Home services" },
  { value: "other", label: "Other business" },
  { value: "nonprofit", label: "Nonprofit" },
] as const;

export const LOCATIONS = [
  { value: "us", label: "United States" },
  { value: "ca_uk_au", label: "Canada / UK / Australia" },
  { value: "eu", label: "EU" },
  { value: "elsewhere", label: "Elsewhere" },
] as const;

export const YEARS = [
  { value: "lt3", label: "Less than 3" },
  { value: "3_4", label: "3–4 years" },
  { value: "5_9", label: "5–9 years" },
  { value: "10_plus", label: "10+ years" },
] as const;

export const SYSTEM_OPTIONS = [
  { value: "m365", label: "Microsoft 365 / Outlook" },
  { value: "google", label: "Google Workspace / Gmail" },
  { value: "chat", label: "Slack or Teams" },
  { value: "crm", label: "A CRM (HubSpot, Salesforce, etc.)" },
  { value: "pm", label: "Practice / PM software" },
  { value: "accounting", label: "QuickBooks / NetSuite" },
  { value: "servicetitan", label: "ServiceTitan" },
  { value: "calls", label: "Zoom / call recording" },
  { value: "files", label: "Dropbox / Drive / SharePoint" },
  { value: "other", label: "Other" },
] as const;

export const OWNERSHIP = [
  { value: "own", label: "Our own accounts" },
  { value: "mixed", label: "Mostly ours, some client-owned" },
  { value: "client", label: "Mostly client-owned or a parent/franchisor's" },
] as const;

export const PRIOR_CONTACT = [
  { value: "no", label: "No" },
  { value: "mode", label: "Yes, Mode directly" },
  { value: "partner", label: "Yes, another partner" },
  { value: "unsure", label: "Not sure" },
] as const;

export const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "managing_partner", label: "Managing partner" },
  { value: "ceo", label: "CEO" },
  { value: "coo", label: "COO" },
  { value: "cfo", label: "CFO" },
  { value: "it", label: "IT" },
  { value: "other", label: "Other" },
] as const;

type Values<T extends readonly { value: string }[]> = T[number]["value"];
const values = <T extends readonly { value: string }[]>(arr: T) =>
  arr.map((o) => o.value) as unknown as [Values<T>, ...Values<T>[]];

export const answersSchema = z.object({
  industry: z.enum(values(INDUSTRIES)),
  location: z.enum(values(LOCATIONS)),
  deskEmployees: z.coerce.number().int().min(0).max(1_000_000),
  fieldEmployees: z.coerce.number().int().min(0).max(1_000_000).optional(),
  years: z.enum(values(YEARS)),
  systems: z.array(z.enum(values(SYSTEM_OPTIONS))).max(SYSTEM_OPTIONS.length),
  ownership: z.enum(values(OWNERSHIP)),
  priorContact: z.enum(values(PRIOR_CONTACT)),
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(80),
  lastName: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
  company: z.string().trim().min(1, "Required").max(160),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  role: z.enum(values(ROLES)),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  emailConsent: z.boolean(),
  smsConsent: z.boolean(),
});

export const leadSchema = z
  .object({
    answers: answersSchema,
    contact: contactSchema,
    niche: z.string().max(60).optional(),
    episode: z.string().max(20).optional(),
    pageUrl: z.string().max(500).optional(),
    /** Honeypot: real visitors never see or fill this. */
    fax: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    if (v.contact.smsConsent && !(v.contact.phone && v.contact.phone.replace(/\D/g, "").length >= 10)) {
      ctx.addIssue({ code: "custom", path: ["contact", "phone"], message: "Phone is required for text messages" });
    }
  });

export type Answers = z.infer<typeof answersSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type LeadInput = z.infer<typeof leadSchema>;

export const FREE_MAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "live.com",
  "msn.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "ymail.com",
];

export function isFreeMail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return !!domain && FREE_MAIL_DOMAINS.includes(domain);
}
