import Link from "next/link";
import { NICHES } from "@/content/niches";

export function EpisodeShelf() {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {NICHES.map((n) => {
        const ep = n.episode;
        const meta = [
          ep.episodeNumber != null ? `EP ${ep.episodeNumber}` : null,
          ep.durationMinutes != null ? `${ep.durationMinutes} MIN` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={n.slug} className="w-[78%] shrink-0 snap-start md:w-auto">
            <Link href={`/${n.slug}#listen`} className="flex h-full flex-col rounded-card border border-rule p-5 hover:border-ink-2">
              <span className="eyebrow">{n.shortLabel}</span>
              <span className="mt-3 font-serif text-lg font-semibold leading-snug">{ep.episodeTitle}</span>
              {meta && <span className="mt-auto pt-6 font-mono text-xs text-ink-2 num">{meta}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
