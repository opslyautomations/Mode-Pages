import { NICHES, getNiche } from "@/content/niches";
import { DESK_MINIMUMS } from "@/config/eligibility";
import { renderOg, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Fit check for company data licensing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ niche: string }> }) {
  const niche = getNiche((await params).niche) ?? NICHES[0];
  return renderOg({ eyebrow: niche.label, title: niche.hero.h1, threshold: DESK_MINIMUMS[niche.scoringKey] });
}
