import type { Niche } from "../types";
import { todoEpisode } from "../episode-todo";

export const accountingFirms: Niche = {
  slug: "accounting-firms",
  label: "Accounting & Finance Firms",
  shortLabel: "Accounting",
  vanityPath: "/cpa",
  industry: "accounting",
  scoringKey: "accounting_finance",
  regulated: true,
  seo: {
    title: "CPA Firm Data Licensing for AI Training",
    description:
      "CPA firm data licensing for AI: Our data partner licenses a de-identified copy of accounting and finance firm records. Firms with 10+ desk employees and 3+ years of records may qualify.",
    keywords: [
      "CPA firm data licensing AI",
      "accounting firm AI training data",
      "license accounting firm data for AI training",
      "finance firm data licensing",
    ],
  },
  hero: {
    eyebrow: "Accounting & finance firms",
    h1: "Accounting is one of the two categories AI labs want most. Your firm's history is the proof of how it's done.",
    sub: "Our data partner licenses a de-identified copy of CPA and finance firm records for AI training. Firms with 10+ employees and several years of records may qualify.",
  },
  records: [
    "Client correspondence and email",
    "Engagement letters and workpaper documents",
    "QuickBooks, NetSuite, and practice-management data",
    "Paychex and payroll operations",
    "Review notes and sign-off trails",
    "Internal chat (Teams, Slack)",
    "Scheduling and capacity planning",
  ],
  deidExample: [
    { before: "Client: Hartwell Supply LLC", after: "Client: Company 01" },
    { before: "EIN 84-2219034", after: "EIN [REDACTED]" },
    { before: "From: m.chen@chenandpark.cpa", after: "From: Reviewer B <person_031@firm.example>" },
    { before: "Q3 close: Hartwell AR over 90 days, flag for M. Chen", after: "Q3 close: Company 01 AR over 90 days, flag for Reviewer B" },
  ],
  hook: {
    quote: "Workplace AI agents need to learn how real firms handle close, review, client questions, and exceptions.",
    body: "That judgment doesn't live in textbooks. It lives in your email threads and workpapers: the reviewer note that caught a misclassification, the client who sent the wrong statement twice, the partner who decided how to treat an exception. AI labs are actively buying workplace data now, and our data partner and other buyers are competing for supply. A firm with years of that history holds rare training material, and a licensed, de-identified copy can become a new revenue line from records you already own.",
  },
  fitNotes: [
    "10+ employees who work at a desk.",
    "Several years of digital records that the firm owns.",
    "A U.S.-based team is the strongest fit.",
    "Tax-return information has specific consent rules (IRS §7216). You can scope tax-prep systems out.",
  ],
  faqs: [
    {
      q: "What about IRS §7216 and tax-return information?",
      a: "Tax-return information has specific disclosure and consent requirements under §7216. Have your counsel or professional liability carrier review before signing. You can scope out tax-prep systems entirely, and many firms start with email, chat, and advisory or bookkeeping records instead.",
    },
    {
      q: "How does this fit with client confidentiality and AICPA rules?",
      a: "Your confidentiality obligations are yours to confirm, so have counsel review the agreement against them. Our data partner removes or transforms identifiers before delivery, and you choose which systems, clients, and date ranges are in scope.",
    },
    {
      q: "Can we exclude tax season data or specific clients?",
      a: "Yes. Scope is set by system, date range, and exclusions you specify. You can leave out busy-season months, particular clients, or whole practice lines, and the written agreement records those choices before any export.",
    },
    {
      q: "Do we have to hand over passwords?",
      a: "No. Your team signs in to approved systems itself. No credentials are shared with our data partner or with us.",
    },
    {
      q: "Will this disrupt busy season?",
      a: "It shouldn't. Your team spends a few hours: reviewing scope and signing in to approved systems. No operational changes are required, and you can schedule that work off-peak.",
    },
    {
      q: "What does it cost the firm?",
      a: "There is no broker fee. Your cost is time to review scope and the contract, plus any review by your own counsel or carrier.",
    },
    {
      q: "How long does it take?",
      a: "Our data partner generally expects about three months from the first conversation to payment. A written agreement fixes the amount, payment schedule, systems, date ranges, rights, and any exclusivity before any export.",
    },
  ],
  episode: todoEpisode("Accounting & Finance Firms"),
};
