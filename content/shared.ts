import { DISCLOSURE, PARTNER_NAME } from "@/config/site";

export const REGULATED_NOTE =
  "Firms with professional confidentiality duties (attorney–client privilege and confidentiality rules, IRS §7216 for tax preparers, HIPAA for medical practices) should have their own counsel review any data agreement before signing. Our data partner removes or transforms identifiers before delivery, and you choose what is in scope, but your obligations are yours to confirm.";

export const TIMELINE_SENTENCE = "Our data partner generally expects about three months from the first conversation to payment.";
export const TEAM_TIME_SENTENCE =
  "Your team spends a few hours: reviewing scope and signing in to approved systems. No operational changes are required.";
export const AGREEMENT_SENTENCE =
  "A written agreement fixes the amount, payment schedule, systems, date ranges, rights, and any exclusivity before any export.";

export const PROCESS_STEPS = [
  {
    title: "Intake",
    body: `A short call with ${PARTNER_NAME} to confirm your details. ${PARTNER_NAME} then introduces your firm to our data partner.`,
  },
  {
    title: "Estimate + 14-day nonbinding LOI",
    body: "Our data partner reviews your systems and history and provides an estimate with a 14-day nonbinding letter of intent.",
  },
  {
    title: "Review offer, approve scope",
    body: "You choose which systems and date ranges are included. " + AGREEMENT_SENTENCE,
  },
  {
    title: "Sign in, export, de-identify",
    body: "Your team signs in to approved systems. Our data partner exports the agreed copy and removes or transforms identifiers. No passwords handed over.",
  },
  {
    title: "Paid under agreed terms",
    body: "Payment follows the schedule in your agreement. " + TIMELINE_SENTENCE,
  },
] as const;

export const KEEP_CONTROL = [
  { icon: "Archive", title: "Originals stay with you", body: "Our data partner licenses a copy. Your files, systems, and ownership don't move." },
  { icon: "ListChecks", title: "You choose the systems", body: "Include email but not billing, or chat but not documents. Your call." },
  { icon: "CalendarRange", title: "You choose date ranges", body: "Set the years in scope and carve out any period you'd rather leave out." },
  { icon: "KeyRound", title: "No passwords handed over", body: "Your own team signs in to approved systems. Credentials stay with you." },
  { icon: "Settings2", title: "No operational changes", body: "Nothing about how your team works changes. A few hours of review is the ask." },
  { icon: "BadgeDollarSign", title: "No broker fee", body: "You pay us nothing. We're compensated by our data partner, as disclosed below." },
] as const;

export const RECORD_CATEGORIES = [
  { before: "Email & calendar", after: "Threads, replies, scheduling, meeting invites" },
  { before: "Documents & files", after: "Drafts, versions, comments, shared folders" },
  { before: "Chat & collaboration", after: "Slack, Teams, project boards, wikis" },
  { before: "Calls & transcripts", after: "Recorded calls, meeting transcripts" },
  { before: "CRM & sales", after: "Pipelines, notes, proposals, activity history" },
  { before: "Billing & operations", after: "Invoices, time entries, payroll ops, dispatch" },
];

export const SYSTEMS = [
  "Microsoft 365",
  "Gmail",
  "Outlook",
  "Google Drive",
  "Slack",
  "Jira",
  "Confluence",
  "Salesforce",
  "HubSpot",
  "Zendesk",
  "Notion",
  "Monday.com",
  "Dropbox",
  "Zoom",
  "AutoCAD",
  "Figma",
  "NetSuite",
  "Paychex",
  "QuickBooks",
  "ServiceTitan",
];

export const GENERAL_FAQS = [
  {
    q: "What is a company data partnership?",
    a: "Our data partner buys a licensed, de-identified copy of a company's historical operating records (email, documents, chat, CRM, billing) and supplies it to AI labs that are training workplace agents. The company keeps its originals and its systems, shares no passwords, and pays no broker fee. It's a new revenue line from records you already own.",
  },
  {
    q: "Are we selling our company or our data?",
    a: "No. You license a copy. Your originals and your ownership stay with you, and the written agreement defines exactly which systems and date ranges are in scope, what rights our data partner receives, and any exclusivity.",
  },
  {
    q: "Who actually buys it?",
    a: "Our data partner buys the copy directly, de-identifies it, and supplies it for AI research and training. You contract with our data partner, not with the AI labs.",
  },
  {
    q: "Do AI developers see our raw records?",
    a: "No. They receive a filtered copy after sensitive-information removal. Identifiers are removed or transformed before delivery.",
  },
  {
    q: "Will our records be made public?",
    a: "Our data partner says it does not publish source records or sell reports about your company. The agreement sets out the rights granted, so you can confirm that in writing.",
  },
  {
    q: "Do you need our passwords?",
    a: "No. Your team signs in to approved systems itself. No credentials are handed to our data partner or to us.",
  },
  {
    q: "How is the offer determined?",
    a: "Our data partner looks at the systems and date ranges in scope, years of history, data volume and quality, and ownership and access terms. Any calculator figures are illustrative. Our data partner's published range is $100K–$5M, indicative. Indicative only. Our data partner sets a fixed offer after reviewing your systems, history, and data volume.",
  },
  {
    q: "What does it cost?",
    a: "No broker fee. Your cost is time: reviewing scope and the contract, and signing in to approved systems. " + TEAM_TIME_SENTENCE,
  },
  {
    q: "How long does it take?",
    a: TIMELINE_SENTENCE + " " + AGREEMENT_SENTENCE,
  },
  {
    q: "Who are you and how are you paid?",
    a: DISCLOSURE,
  },
  {
    q: "Is this the same as micro1's program?",
    a: "Other buyers, including micro1, have announced similar programs. We work with one established buyer, and we name them on your call before anything is registered. Compare terms on scope control, de-identification, and fees.",
  },
];
