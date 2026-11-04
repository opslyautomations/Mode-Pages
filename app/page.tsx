import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/config/site";
import { Section, JsonLd } from "@/components/ui";
import {
  AccordionFAQ,
  CTABand,
  CredibilityNotes,
  HeroStatement,
  NicheSelector,
  NumberedTimeline,
  SpecSheet,
  SystemsWall,
} from "@/components/blocks";
import { EpisodeShelf } from "@/components/EpisodeShelf";
import { CREDIBILITY_NOTES, GENERAL_FAQS, PROCESS_STEPS, RECORD_CATEGORIES, SYSTEMS } from "@/content/shared";
import { faqLd, pageMetadata, podcastSeriesLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME}: License Company Records for AI Training`,
  description:
    "AI labs are paying for real examples of how professionals work. Mode buys a de-identified copy of company records. Check in 90 seconds whether your firm qualifies.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroStatement
        eyebrow={`${SITE_NAME} · Company data licensing`}
        h1="Your firm's operating history may be worth more than you think."
        sub="AI labs are paying for real examples of how professionals work. Mode buys a de-identified copy of company records. We help you find out if you qualify."
        cta={
          <>
            <Link href="/qualify" className="btn btn-primary" data-cta="home-hero">
              Check my fit
            </Link>
            <Link href="/how-it-works" className="link">
              How it works
            </Link>
          </>
        }
      />

      <Section eyebrow="Start with your industry" title="Pick the one that describes your firm." intro="Each category has its own published minimum for full-time desk employees. Every category needs 3+ years of digital records you own.">
        <NicheSelector />
      </Section>

      <Section eyebrow="From the show" title="Heard us on the podcast?" tone="paper-2">
        <EpisodeShelf />
      </Section>

      <Section eyebrow="What counts" title="What counts as operating records" intro="Mode licenses a copy of everyday work records across six categories. You choose which are in scope.">
        <SpecSheet leftHeader="Category" rightHeader="Examples" rows={RECORD_CATEGORIES} />
      </Section>

      <Section eyebrow="Systems" title="Records from the tools you already use" tone="paper-2">
        <SystemsWall systems={SYSTEMS} />
      </Section>

      <Section eyebrow="The process" title="From first call to payment in about three months">
        <NumberedTimeline steps={PROCESS_STEPS} />
      </Section>

      <Section eyebrow="About Mode" title="Who's buying" tone="paper-2" intro="Factual notes about Mode, the buyer. We are an independent referral partner, not Mode.">
        <CredibilityNotes notes={CREDIBILITY_NOTES} />
      </Section>

      <Section eyebrow="Questions" title="Common questions">
        <AccordionFAQ faqs={GENERAL_FAQS} />
      </Section>

      <CTABand href="/qualify" />

      <JsonLd data={podcastSeriesLd()} />
      <JsonLd data={faqLd(GENERAL_FAQS)} />
    </>
  );
}
