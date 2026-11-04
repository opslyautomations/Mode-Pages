import type { EligibilityKey } from "@/config/eligibility";

export type Chapter = { time: string; label: string };

export type Episode = {
  episodeTitle: string;
  episodeNumber: number | null;
  publishDate: string; // ISO date
  durationMinutes: number | null;
  embedUrl: string; // Spotify / Apple / YouTube / Buzzsprout iframe src
  audioUrl?: string;
  /** Show notes in markdown-lite: paragraphs separated by blank lines, "## " headings. */
  showNotes: string;
  /** Full transcript, markdown-lite. Paste the real transcript; never invent one. */
  transcript: string;
  chapters: Chapter[];
  /** Does the player provider support ?t= deep links (YouTube, Buzzsprout)? */
  supportsDeepLinks: boolean;
};

export type IndustryValue =
  | "legal"
  | "accounting"
  | "medical"
  | "agency"
  | "home_services"
  | "other"
  | "nonprofit";

export type Niche = {
  slug: string;
  label: string;
  shortLabel: string;
  /** The short URL hosts say on air, e.g. "/law". Must exist in next.config.ts redirects. */
  vanityPath: string;
  industry: IndustryValue;
  scoringKey: EligibilityKey;
  regulated: boolean;
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; h1: string; sub: string };
  records: string[];
  deidExample: { before: string; after: string }[];
  hook: { quote: string; body: string };
  fitNotes: string[];
  /** Shown as a NoticeBar directly under the hero (home services). */
  aboveFoldNotice?: string;
  faqs: { q: string; a: string }[];
  episode: Episode;
};
