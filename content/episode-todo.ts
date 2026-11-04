import type { Episode } from "./types";

/**
 * Placeholder episode. Replace per niche with the real episode metadata,
 * embed URL, chapters and the actual transcript. Never invent a transcript.
 * Any field starting with TODO_ triggers a build warning.
 */
export function todoEpisode(nicheLabel: string): Episode {
  return {
    episodeTitle: `TODO_EPISODE_TITLE (${nicheLabel})`,
    episodeNumber: null,
    publishDate: "",
    durationMinutes: null,
    embedUrl: "",
    audioUrl: undefined,
    showNotes: "",
    transcript: "",
    chapters: [],
    supportsDeepLinks: false,
  };
}
