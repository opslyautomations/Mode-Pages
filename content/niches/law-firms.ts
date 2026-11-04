import type { Niche } from "../types";
import { todoEpisode } from "../episode-todo";

export const lawFirms: Niche = {
  slug: "law-firms",
  label: "Law Firms",
  shortLabel: "Law",
  vanityPath: "/law",
  industry: "legal",
  scoringKey: "legal",
  regulated: true,
  seo: {
    title: "License Law Firm Data for AI Training",
    description:
      "An AI training data program for law firms: Our data partner licenses a de-identified copy of firm records. Firms with 6+ desk employees and 3+ years of records may qualify. Check your fit in 90 seconds.",
    keywords: [
      "license law firm data for AI training",
      "AI training data program for law firms",
      "law firm data licensing",
      "legal AI training data",
    ],
  },
  hero: {
    eyebrow: "Law firms",
    h1: "Your firm's case history is exactly what AI labs are trying to learn from.",
    sub: "Our data partner licenses a de-identified copy of law firm operating records to train AI on how legal work actually gets done. Firms with 6+ employees and several years of records may qualify.",
  },
  records: [
    "Matter correspondence and email",
    "Drafts, redlines, and version history",
    "Intake notes and conflict checks",
    "Calendaring and docketing",
    "Billing and time entries",
    "Practice-management data (Clio, MyCase, NetDocuments, iManage where in scope)",
    "Internal chat (Teams, Slack)",
  ],
  deidExample: [
    { before: "Client: Hartwell Supply LLC", after: "Client: Company 01" },
    { before: "From: dana.reyes@reyesfirm.com", after: "From: Attorney A <person_014@firm.example>" },
    { before: "Re: Hartwell v. Ostrander, Case No. 24-CV-1182", after: "Re: Matter 07 v. Party 03, Case No. [REDACTED]" },
    { before: "Call Ms. Ostrander at (312) 555-0147", after: "Call Person 22 at [PHONE]" },
  ],
  hook: {
    quote: "AI labs are prioritizing legal work product: how lawyers reason through matters, draft, negotiate, and decide.",
    body: "Legal reasoning is hard to fake. The back-and-forth of a real matter (the first draft, the partner's markup, the client's pushback, the deadline that moved) is the kind of material that cannot be synthesized at scale. Firms that have run on email and practice-management software for years hold exactly that record. AI labs are actively buying workplace data now, and our data partner and other buyers are competing for supply. That is the reason to look at this now: demand is active today, and you decide whether any of it is a fit for your firm.",
  },
  fitNotes: [
    "6+ employees who work at a desk: attorneys, paralegals, and staff.",
    "Several years of digital records that the firm owns.",
    "A U.S.-based team is the strongest fit.",
  ],
  faqs: [
    {
      q: "What about privilege and client confidentiality?",
      a: "This is the first question to put to your own ethics counsel, and we encourage every firm to do that before signing anything. Our data partner removes or transforms identifiers before delivery, and you control which systems, matters, and date ranges are in scope. Many firms exclude privileged matters entirely. None of that resolves your professional obligations for you; your counsel confirms what is appropriate.",
    },
    {
      q: "Does the firm need client consent?",
      a: "That's a question for your ethics counsel. Some firms will exclude privileged matters entirely, and scope control allows that. Your counsel can also advise whether specific engagement terms or jurisdictions change the answer.",
    },
    {
      q: "Can we exclude practice areas, matters, or date ranges?",
      a: "Yes. You choose which systems are included and which date ranges are covered, and you can carve out practice areas or specific matters. The written agreement lists exactly what is in scope before any export happens.",
    },
    {
      q: "Do we have to hand over passwords?",
      a: "No. Your team signs in to the approved systems itself. No credentials are shared with our data partner or with us.",
    },
    {
      q: "Who sees our original files?",
      a: "No one outside your systems. Originals stay where they are. Our data partner works on the agreed copy in a secure workspace, de-identifies it, and only the filtered copy is supplied for AI research and training.",
    },
    {
      q: "Does this affect our malpractice coverage?",
      a: "Ask your carrier. Policies differ, and your carrier is the only party who can confirm how a data licensing agreement interacts with your coverage. Many firms make that call alongside the counsel review.",
    },
    {
      q: "What does it cost the firm?",
      a: "There is no broker fee. Your cost is time: a few hours to review scope and sign in to approved systems, plus your own counsel's review of the agreement. No operational changes are required.",
    },
    {
      q: "How long does it take?",
      a: "Our data partner generally expects about three months from the first conversation to payment. A written agreement fixes the amount, payment schedule, systems, date ranges, rights, and any exclusivity before any export.",
    },
  ],
  episode: todoEpisode("Law Firms"),
};
