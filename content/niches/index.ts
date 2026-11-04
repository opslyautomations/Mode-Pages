import type { Niche } from "../types";
import { lawFirms } from "./law-firms";
import { accountingFirms } from "./accounting-firms";
import { marketingAgencies } from "./marketing-agencies";
import { homeServices } from "./home-services";

/**
 * Niche registry. To add a niche: create a file in this folder and add one line here.
 * Pages, qualifier presets, schema, sitemap, llms.txt and OG images all read from this list.
 */
export const NICHES: Niche[] = [lawFirms, accountingFirms, marketingAgencies, homeServices];

export function getNiche(slug: string | null | undefined): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}
