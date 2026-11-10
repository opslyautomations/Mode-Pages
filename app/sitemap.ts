import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["", "/disclosure", "/privacy", "/terms"].map((p) => ({
    url: `${BASE_URL}${p}`,
    lastModified: now,
    priority: p === "" ? 1 : 0.4,
  }));
}
