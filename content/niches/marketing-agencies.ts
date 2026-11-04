import type { Niche } from "../types";
import { todoEpisode } from "../episode-todo";

export const marketingAgencies: Niche = {
  slug: "marketing-agencies",
  label: "Marketing Agencies",
  shortLabel: "Agencies",
  vanityPath: "/agency",
  industry: "agency",
  scoringKey: "other",
  regulated: false,
  seo: {
    title: "Marketing Agency Data Licensing for AI Training",
    description:
      "Marketing agency data licensing: our data partner licenses a de-identified copy of agency operating records for AI training. Agencies with 20+ desk employees and 3+ years of history may qualify.",
    keywords: [
      "marketing agency data licensing",
      "agency AI training data",
      "license agency Slack data for AI training",
      "creative agency data licensing",
    ],
  },
  hero: {
    eyebrow: "Marketing & creative agencies",
    h1: "Your agency's Slack, briefs, and client threads show AI how creative work really happens.",
    sub: "Our data partner licenses a de-identified copy of agency operating records for AI training. Agencies with 20+ desk employees and several years of history may qualify.",
  },
  records: [
    "Briefs, creative reviews, and feedback rounds",
    "Project management (Asana, Monday.com, Jira, Notion)",
    "Slack channels and threads",
    "Figma files and comments",
    "HubSpot or Salesforce CRM",
    "Proposals and SOWs",
    "Time tracking and billing",
  ],
  deidExample: [
    { before: "Client: Hartwell Supply", after: "Client: Company 01" },
    { before: "@jordan can we push the Hartwell launch to the 14th?", after: "@person_009 can we push the Company 01 launch to [DATE]?" },
    { before: "SOW #HS-2024-03, Hartwell retainer renewal", after: "SOW #[ID], Company 01 retainer renewal" },
    { before: "Figma: Hartwell_Q2_Campaign_v7", after: "Figma: Company01_Campaign_v7" },
  ],
  hook: {
    quote: "AI labs need examples of how teams scope, revise, push back, and ship.",
    body: "Agencies generate this all day. A single campaign leaves a trail of briefs, revision rounds, scope debates, approvals, and late-night Slack threads, which is the clearest record anywhere of how collaborative knowledge work actually moves. AI labs are actively buying workplace data now, and our data partner and other buyers are competing for supply. The key question for agencies is ownership: only the records in your own workspace count.",
  },
  fitNotes: [
    "20+ full-time desk employees.",
    "Only records your agency owns: your own workspace, inbox, and CRM.",
    "Data living in client-owned ad accounts, client CMSs, or client Google Workspaces is usually not yours to license. Check your MSAs.",
  ],
  faqs: [
    {
      q: "What about client confidentiality clauses in our MSAs?",
      a: "Review your contracts first. Many MSAs restrict how client materials can be used, and those terms come before anything else. Scope can exclude client-identifying projects or whole accounts, and our data partner removes or transforms identifiers before delivery.",
    },
    {
      q: "What about white-label work we do for other agencies?",
      a: "Generally exclude it. If you produced work under another agency's brand, you may not own those records, so the safe default is to leave them out of scope.",
    },
    {
      q: "Do freelancers and contractors count toward the 20?",
      a: "The threshold is full-time desk employees, so freelancers and contractors generally don't count. Our data partner makes the final call on eligibility after reviewing your details.",
    },
    {
      q: "Does this compete with the AI services we sell?",
      a: "No. This is a one-time license of a de-identified copy of your own operating records. It doesn't restrict the services you offer or the tools you use, and any exclusivity terms are spelled out in the written agreement before you sign.",
    },
    {
      q: "Do we have to hand over passwords?",
      a: "No. Your team signs in to approved systems itself. No credentials are shared with our data partner or with us.",
    },
    {
      q: "What does it cost the agency?",
      a: "There is no broker fee. Your team spends a few hours reviewing scope and signing in to approved systems. No operational changes are required.",
    },
    {
      q: "How long does it take?",
      a: "Our data partner generally expects about three months from the first conversation to payment. A written agreement fixes the amount, payment schedule, systems, date ranges, rights, and any exclusivity before any export.",
    },
  ],
  episode: todoEpisode("Marketing Agencies"),
};
