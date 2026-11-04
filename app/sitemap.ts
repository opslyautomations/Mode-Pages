import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config/site";
import { NICHES } from "@/content/niches";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["", "/qualify", "/how-it-works", "/faq", "/disclosure", "/privacy", "/terms"];
  return [
    ...fixed.map((p) => ({ url: `${BASE_URL}${p}`, lastModified: now, priority: p === "" ? 1 : 0.6 })),
    ...NICHES.flatMap((n) => [
      { url: `${BASE_URL}/${n.slug}`, lastModified: now, priority: 0.9 },
      { url: `${BASE_URL}/${n.slug}/episode`, lastModified: n.episode.publishDate ? new Date(n.episode.publishDate) : now, priority: 0.7 },
    ]),
  ];
}
