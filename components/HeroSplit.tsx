import Link from "next/link";
import { PODCAST_SHOW_URL, SITE_NAME } from "@/config/site";
import type { Niche } from "@/content/types";
import { PodcastPlayer } from "./PodcastPlayer";

/** Episode hero: copy left, framed player right. H1 is never animated. */
export function HeroSplit({ niche }: { niche: Niche }) {
  const ep = niche.episode;
  const eyebrow = ep.episodeNumber != null ? `From Episode ${ep.episodeNumber} of ${SITE_NAME}` : `From ${SITE_NAME} · ${niche.hero.eyebrow}`;
  return (
    <section className="page-grid grid gap-10 pb-14 pt-12 md:grid-cols-12 md:gap-12 md:pb-20 md:pt-20">
      <div className="md:col-span-7">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="h1">{niche.hero.h1}</h1>
        <p className="mt-6 max-w-measure text-lg text-ink-2">{niche.hero.sub}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href="#qualify" className="btn btn-primary" data-cta="hero">
            Check if your firm qualifies — 90 seconds
          </a>
          <a href="#listen" className="link">
            Listen to the episode
          </a>
        </div>
      </div>
      <div className="md:col-span-5">
        <PodcastPlayer episode={ep} showUrl={PODCAST_SHOW_URL} niche={niche.slug} />
        {(ep.transcript || ep.showNotes) && (
          <Link href={`/${niche.slug}/episode`} className="link mt-3 inline-block text-sm">
            Show notes and full transcript
          </Link>
        )}
      </div>
    </section>
  );
}
