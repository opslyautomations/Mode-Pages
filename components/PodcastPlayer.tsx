"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { Episode } from "@/content/types";
import { track } from "@/lib/analytics";

function toSeconds(t: string): number {
  return t
    .split(":")
    .map(Number)
    .reduce((acc, n) => acc * 60 + (Number.isFinite(n) ? n : 0), 0);
}

function withTime(src: string, seconds: number): string {
  try {
    const u = new URL(src);
    if (/youtube(-nocookie)?\.com/.test(u.hostname)) u.searchParams.set("start", String(seconds));
    else u.searchParams.set("t", String(seconds));
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return src;
  }
}

/**
 * PodcastPlayer + ChapterList. The iframe is a click-to-load facade so it
 * never competes with LCP. Falls back to <audio> when only audioUrl is set.
 */
export function PodcastPlayer({
  episode,
  showUrl,
  niche,
}: {
  episode: Episode;
  showUrl: string;
  niche: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const hasEmbed = !!episode.embedUrl;
  const caption = [
    episode.episodeNumber != null ? `EP ${episode.episodeNumber}` : "EPISODE",
    episode.durationMinutes != null ? `${episode.durationMinutes} MIN` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function load(seconds?: number) {
    if (!hasEmbed) return;
    const url = seconds != null ? withTime(episode.embedUrl, seconds) : withTime(episode.embedUrl, 0);
    setSrc(url);
    track("episode_play", { niche, ep: episode.episodeNumber ?? "" });
  }

  return (
    <div id="listen" className="rounded-card border border-rule bg-paper">
      <p className="border-b border-rule px-4 py-2 font-mono text-xs text-ink-2 num">{caption}</p>
      <div className="p-4">
        {src ? (
          <iframe
            src={src}
            title={episode.episodeTitle}
            className="aspect-video w-full rounded-card border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        ) : hasEmbed ? (
          <button
            type="button"
            onClick={() => load()}
            className="group flex aspect-video w-full flex-col items-start justify-end gap-3 rounded-card bg-paper-2 p-5 text-left"
            aria-label={`Play episode: ${episode.episodeTitle}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform group-hover:scale-105">
              <Play className="ml-1 h-6 w-6" aria-hidden="true" fill="currentColor" />
            </span>
            <span className="font-serif text-lg font-semibold leading-snug">{episode.episodeTitle}</span>
          </button>
        ) : episode.audioUrl ? (
          <div>
            <p className="mb-3 font-serif text-lg font-semibold">{episode.episodeTitle}</p>
            <audio controls preload="none" className="w-full" src={episode.audioUrl} onPlay={() => track("episode_play", { niche })} />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col justify-end gap-3 rounded-card bg-paper-2 p-5">
            <span className="font-serif text-lg font-semibold leading-snug">{episode.episodeTitle}</span>
            <a href={showUrl} className="link text-sm" rel="noopener">
              Listen to the show
            </a>
          </div>
        )}
      </div>

      {episode.chapters.length > 0 && (
        <div className="border-t border-rule px-4 py-3">
          <p className="eyebrow mb-2">Chapters</p>
          <ol className="space-y-1 text-sm">
            {episode.chapters.map((c) => (
              <li key={c.time} className="flex gap-3">
                {episode.supportsDeepLinks && hasEmbed ? (
                  <button type="button" onClick={() => load(toSeconds(c.time))} className="flex min-h-[32px] gap-3 text-left hover:text-accent">
                    <span className="w-12 shrink-0 font-mono text-ink-2 num">{c.time}</span>
                    <span>{c.label}</span>
                  </button>
                ) : (
                  <>
                    <span className="w-12 shrink-0 font-mono text-ink-2 num">{c.time}</span>
                    <span>{c.label}</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
