import type { Metadata } from "next";
import { BASE_URL, DISCLOSURE, PARTNER_COMPANY, PARTNER_EMAIL, PARTNER_NAME, PODCAST_SHOW_URL, SITE_NAME, isTodo } from "@/config/site";
import type { Niche } from "@/content/types";

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = `${BASE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

/* ----------------------------------------------------------- JSON-LD */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#org`,
    name: PARTNER_COMPANY,
    url: BASE_URL,
    ...(isTodo(PARTNER_EMAIL) ? {} : { email: PARTNER_EMAIL }),
    description: DISCLOSURE,
    founder: isTodo(PARTNER_NAME) ? undefined : { "@type": "Person", name: PARTNER_NAME },
  };
}

export function podcastSeriesLd() {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "@id": `${BASE_URL}/#podcast`,
    name: SITE_NAME,
    url: isTodo(PODCAST_SHOW_URL) ? BASE_URL : PODCAST_SHOW_URL,
    publisher: { "@id": `${BASE_URL}/#org` },
  };
}

export function podcastEpisodeLd(niche: Niche) {
  const ep = niche.episode;
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: ep.episodeTitle,
    url: `${BASE_URL}/${niche.slug}/episode`,
    ...(ep.episodeNumber != null ? { episodeNumber: ep.episodeNumber } : {}),
    ...(ep.publishDate ? { datePublished: ep.publishDate } : {}),
    ...(ep.durationMinutes != null ? { timeRequired: `PT${ep.durationMinutes}M` } : {}),
    ...(ep.audioUrl ? { associatedMedia: { "@type": "MediaObject", contentUrl: ep.audioUrl } } : {}),
    description: niche.seo.description,
    partOfSeries: { "@id": `${BASE_URL}/#podcast`, "@type": "PodcastSeries", name: SITE_NAME },
  };
}

export function faqLd(faqs: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path}`,
    })),
  };
}
