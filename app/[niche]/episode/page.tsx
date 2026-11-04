import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL, PODCAST_SHOW_URL, SITE_NAME } from "@/config/site";
import { NICHES, getNiche } from "@/content/niches";
import { PodcastPlayer } from "@/components/PodcastPlayer";
import { CTABand, Disclosure } from "@/components/blocks";
import { JsonLd, TextBlocks } from "@/components/ui";
import { breadcrumbLd, pageMetadata, podcastEpisodeLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.slug }));
}

type Props = { params: Promise<{ niche: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const niche = getNiche((await params).niche);
  if (!niche) return {};
  return pageMetadata({
    title: `${niche.episode.episodeTitle}: Show Notes & Transcript`,
    description: `Full show notes, chapters, and transcript. ${niche.seo.description}`,
    path: `/${niche.slug}/episode`,
  });
}

/** Splits the transcript into ~800-word chunks so a compact CTA can sit between them. */
function chunkTranscript(text: string, words = 800): string[] {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
  const chunks: string[] = [];
  let cur: string[] = [];
  let count = 0;
  for (const p of paras) {
    cur.push(p);
    count += p.split(/\s+/).length;
    if (count >= words) {
      chunks.push(cur.join("\n\n"));
      cur = [];
      count = 0;
    }
  }
  if (cur.length) chunks.push(cur.join("\n\n"));
  return chunks;
}

export default async function EpisodePage({ params }: Props) {
  const niche = getNiche((await params).niche);
  if (!niche) notFound();
  const ep = niche.episode;
  const vanity = `${BASE_URL.replace(/^https?:\/\//, "")}${niche.vanityPath}`;
  const chunks = chunkTranscript(ep.transcript);

  return (
    <article className="page-grid grid gap-12 py-12 md:grid-cols-12 md:py-20">
      <header className="md:col-span-12">
        <nav aria-label="Breadcrumb" className="eyebrow mb-4">
          <Link href={`/${niche.slug}`} className="hover:text-ink">
            {niche.label}
          </Link>{" "}
          / Episode
        </nav>
        <h1 className="h1 max-w-4xl">{ep.episodeTitle}</h1>
        {ep.publishDate && (
          <p className="mt-4 font-mono text-sm text-ink-2 num">
            {SITE_NAME} · {new Date(ep.publishDate).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        )}
      </header>

      <div className="md:col-span-7">
        {ep.showNotes && (
          <section aria-labelledby="notes">
            <h2 id="notes" className="h2 mb-4">
              Show notes
            </h2>
            <TextBlocks text={ep.showNotes} />
          </section>
        )}

        {chunks.length > 0 && (
          <section aria-labelledby="transcript" className="mt-12">
            <h2 id="transcript" className="h2 mb-4">
              Transcript
            </h2>
            {chunks.map((c, i) => (
              <div key={i}>
                <TextBlocks text={c} />
                {i < chunks.length - 1 && <CTABand compact href={`/qualify?niche=${niche.slug}`} title="Does your firm qualify? Find out in 90 seconds." />}
              </div>
            ))}
          </section>
        )}

        {!ep.showNotes && chunks.length === 0 && (
          <p className="max-w-measure text-ink-2">{niche.hero.sub}</p>
        )}
      </div>

      <aside className="space-y-6 md:col-span-5">
        <PodcastPlayer episode={ep} showUrl={PODCAST_SHOW_URL} niche={niche.slug} />
        <div className="rounded-card border border-rule p-5">
          <p className="eyebrow mb-3">Mentioned in this episode</p>
          <ul className="space-y-2 text-[15px]">
            <li>
              Spoken URL: <span className="font-mono">{vanity}</span>
            </li>
            <li>
              <Link href={`/qualify?niche=${niche.slug}`} className="link">
                The 90-second fit check
              </Link>
            </li>
            <li>
              <Link href={`/${niche.slug}`} className="link">
                {niche.label}: the full overview
              </Link>
            </li>
          </ul>
          <div className="mt-4 border-t border-rule pt-4">
            <Disclosure />
          </div>
        </div>
      </aside>

      <JsonLd data={podcastEpisodeLd(niche)} />
      <JsonLd
        data={breadcrumbLd([
          { name: niche.label, path: `/${niche.slug}` },
          { name: "Episode", path: `/${niche.slug}/episode` },
        ])}
      />
    </article>
  );
}
