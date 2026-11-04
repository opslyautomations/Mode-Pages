import type { Niche } from "../types";
import { todoEpisode } from "../episode-todo";

export const homeServices: Niche = {
  slug: "home-services",
  label: "Home Services Operators",
  shortLabel: "Home Services",
  vanityPath: "/home",
  industry: "home_services",
  scoringKey: "other",
  regulated: false,
  seo: {
    title: "ServiceTitan Data AI Licensing for Home Services",
    description:
      "For multi-location home services operators with 20+ desk employees: our data partner licenses a de-identified copy of dispatch, CSR, and office records for AI training. Most smaller shops won't qualify.",
    keywords: [
      "ServiceTitan data AI licensing",
      "home services data licensing",
      "dispatch data AI training",
      "HVAC plumbing company data licensing",
    ],
  },
  hero: {
    eyebrow: "Home services operators",
    h1: "Running a multi-location home services company? Your dispatch and office history may qualify.",
    sub: "Our data partner's minimum for home services is 20+ full-time desk employees: office, dispatch, CSRs, estimators, managers. Field technicians are counted separately. This is built for larger operators.",
  },
  aboveFoldNotice:
    "Quick check: count only people who work at a desk. If your office team is under 20, this program likely isn't a fit today. Our qualifier will tell you in 90 seconds.",
  records: [
    "ServiceTitan job, dispatch, and customer history",
    "CSR call recordings and transcripts",
    "Office email",
    "Estimates and proposals",
    "QuickBooks or NetSuite billing",
    "Slack or Teams",
    "HR and scheduling",
  ],
  deidExample: [
    { before: "Customer: Linda Ostrander, 1442 Maple Ct", after: "Customer: Person 118, [ADDRESS]" },
    { before: "Tech: Marcus J. (Truck 12)", after: "Tech: Technician 07 (Unit 12)" },
    { before: "Callback, (614) 555-0193, AC not cooling again", after: "Callback, [PHONE], AC not cooling again" },
    { before: "Est. #88213 Hartwell Supply, 3-ton condenser", after: "Est. #[ID] Company 01, 3-ton condenser" },
  ],
  hook: {
    quote: "AI labs want to see how operations teams handle scheduling conflicts, callbacks, pricing decisions, and customer escalations.",
    body: "A large office team generates years of it: the dispatcher juggling three no-heat calls and two techs, the CSR talking an upset customer down, the manager deciding whether a callback is warranty or billable. That is operational judgment that AI agents can't learn from manuals. AI labs are actively buying workplace data now, and our data partner and other buyers are competing for supply. But this program is sized for operators with a substantial office team, and we'd rather tell you that up front.",
  },
  fitNotes: [
    "20+ full-time desk employees: office, dispatch, CSRs, estimators, managers.",
    "Field technicians are counted separately and don't count toward the minimum.",
    "Franchisees: confirm who owns your systems first.",
  ],
  faqs: [
    {
      q: "Do my technicians count?",
      a: "They're counted separately as non-desk employees. The desk count (office, dispatch, CSRs, estimators, managers) drives eligibility. A company with 80 techs and 12 office staff would generally fall below the minimum.",
    },
    {
      q: "We're franchised. Who owns the data?",
      a: "Franchisor systems may belong to the franchisor, not you. Confirm ownership in your franchise agreement before scoping. Systems you run independently, like your own email or accounting, may still be yours.",
    },
    {
      q: "What happens to customer addresses and phone numbers?",
      a: "They're removed or transformed before delivery. Our data partner de-identifies the copy so customer names, addresses, and phone numbers don't leave in usable form, and you choose which systems are in scope.",
    },
    {
      q: "Do we need to be on ServiceTitan?",
      a: "No. ServiceTitan is a supported system, but email, call recordings, accounting, and chat can all be in scope on their own.",
    },
    {
      q: "Do we have to hand over passwords?",
      a: "No. Your team signs in to approved systems itself. No credentials are shared with our data partner or with us.",
    },
    {
      q: "What does it cost?",
      a: "There is no broker fee. Your office team spends a few hours reviewing scope and signing in to approved systems. No operational changes are required.",
    },
    {
      q: "How long does it take?",
      a: "Our data partner generally expects about three months from the first conversation to payment. A written agreement fixes the amount, payment schedule, systems, date ranges, rights, and any exclusivity before any export.",
    },
  ],
  episode: todoEpisode("Home Services Operators"),
};
