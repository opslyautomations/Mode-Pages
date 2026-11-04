import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ELIGIBILITY_LAST_VERIFIED } from "@/config/site";
import { NICHES, getNiche } from "@/content/niches";
import { KEEP_CONTROL, PROCESS_STEPS } from "@/content/shared";
import { HeroSplit } from "@/components/HeroSplit";
import { Section, JsonLd } from "@/components/ui";
import {
  AccordionFAQ,
  CTABand,
  DisclosurePanel,
  FitStrip,
  IconGrid,
  NoticeBar,
  NumberedTimeline,
  QuoteBlock,
  RegulatedNote,
  SpecSheet,
} from "@/components/blocks";
import { QualifierCard } from "@/components/QualifierCard";
import { StickyMobileBar } from "@/components/StickyMobileBar";
import { breadcrumbLd, faqLd, pageMetadata, podcastEpisodeLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.slug }));
}

type Props = { params: Promise<{ niche: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const niche = getNiche((await params).niche);
  if (!niche) return {};
  return {
    ...pageMetadata({ title: niche.seo.title, description: niche.seo.description, path: `/${niche.slug}` }),
    keywords: niche.seo.keywords,
  };
}

export default async function NichePage({ params }: Props) {
  const niche = getNiche((await params).niche);
  if (!niche) notFound();
  const ep = niche.episode.episodeNumber != null ? String(niche.episode.episodeNumber) : undefined;

  return (
    <>
      {/* 1. Episode hero */}
      <HeroSplit niche={niche} />
      {niche.aboveFoldNotice && <NoticeBar>{niche.aboveFoldNotice}</NoticeBar>}

      {/* 2. Fit strip */}
      <Section eyebrow="Fit at a glance" title={`The published minimums for ${niche.label.toLowerCase()}`}>
        <FitStrip niche={niche} lastVerified={ELIGIBILITY_LAST_VERIFIED} />
      </Section>

      {/* 3. What's being licensed */}
      <Section
        eyebrow="What's being licensed"
        title="A de-identified copy of the work you already do"
        tone="paper-2"
        intro={
          <ul className="mt-2 grid gap-x-8 gap-y-1 text-[15px] text-ink sm:grid-cols-2">
            {niche.records.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-accent" aria-hidden="true">
                  ·
                </span>
                {r}
              </li>
            ))}
          </ul>
        }
      >
        <SpecSheet
          leftHeader="Records in your firm"
          rightHeader="What leaves after de-identification"
          rows={niche.deidExample}
          note="Fictional example."
        />
      </Section>

      {/* 4. Why now */}
      <Section eyebrow="Why now" title="Why AI labs want this, and why now">
        <QuoteBlock quote={niche.hook.quote}>
          <p>{niche.hook.body}</p>
        </QuoteBlock>
      </Section>

      {/* 5. What you keep / control */}
      <Section eyebrow="What you keep" title="What you keep, and what you control" tone="paper-2">
        <IconGrid items={KEEP_CONTROL} />
      </Section>

      {/* 6. Process */}
      <Section eyebrow="The process" title="Five steps, about three months">
        <NumberedTimeline steps={PROCESS_STEPS} />
      </Section>

      {/* 7. Inline qualifier */}
      <Section
        id="qualify"
        eyebrow="90-second fit check"
        title="Check if your firm qualifies"
        tone="paper-2"
        intro="Eight quick questions. You'll get an honest result: strong fit, possible fit, or not a fit right now. No dollar estimates, ever."
      >
        <div className="max-w-3xl">
          <QualifierCard niche={niche.slug} episode={ep} />
        </div>
      </Section>

      {/* 8. Objections */}
      <Section eyebrow="Questions" title={`Questions ${niche.label.toLowerCase()} ask`}>
        <AccordionFAQ faqs={niche.faqs} />
        {niche.regulated && <RegulatedNote />}
      </Section>

      {/* 9. Who's behind this */}
      <Section eyebrow="Who's behind this" title="Who you'll be talking to" tone="paper-2">
        <DisclosurePanel />
      </Section>

      {/* 10. Closing CTA */}
      <CTABand href={`/qualify?niche=${niche.slug}`} />

      <StickyMobileBar />
      <JsonLd data={podcastEpisodeLd(niche)} />
      <JsonLd data={faqLd(niche.faqs)} />
      <JsonLd data={breadcrumbLd([{ name: niche.label, path: `/${niche.slug}` }])} />
    </>
  );
}
