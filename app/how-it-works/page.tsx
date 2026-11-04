import type { Metadata } from "next";
import Link from "next/link";
import { INDICATIVE_RANGE } from "@/config/site";
import { AGREEMENT_SENTENCE, KEEP_CONTROL, PROCESS_STEPS, RECORD_CATEGORIES, TEAM_TIME_SENTENCE, TIMELINE_SENTENCE } from "@/content/shared";
import { Section, JsonLd } from "@/components/ui";
import { CTABand, IconGrid, NumberedTimeline, SpecSheet } from "@/components/blocks";
import { ThresholdRuler } from "@/components/ThresholdRuler";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { ELIGIBILITY_LAST_VERIFIED, PARTNER_NAME } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "How Company Data Licensing Works",
  description:
    "How our data partner's company data licensing program works: eligibility, what's licensed, de-identification, the five-step process, and the roughly three-month timeline to payment.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <section className="page-grid pb-12 pt-14 md:pb-16 md:pt-20">
        <p className="eyebrow mb-5">How it works</p>
        <h1 className="h1 max-w-4xl">A licensed, de-identified copy. Your originals never move.</h1>
        <p className="mt-6 max-w-measure text-lg text-ink-2">
          Our data partner buys a de-identified, licensed copy of a company&apos;s historical operating records (email, documents, chat, CRM, billing) to
          supply AI labs training workplace agents. You keep your originals and your systems, share no passwords, and pay no broker fee.
        </p>
      </section>

      <Section eyebrow="Eligibility" title="Who qualifies">
        <div className="max-w-4xl">
          <ThresholdRuler caption={`Minimums as published by our data partner. Last confirmed ${ELIGIBILITY_LAST_VERIFIED}.`} />
        </div>
      </Section>

      <Section eyebrow="What's licensed" title="Six categories of operating records" tone="paper-2">
        <SpecSheet leftHeader="Category" rightHeader="Examples" rows={RECORD_CATEGORIES} />
      </Section>

      <Section eyebrow="The process" title="Five steps">
        <NumberedTimeline steps={PROCESS_STEPS} />
        <div className="mt-10 grid max-w-4xl gap-4 text-ink-2 md:grid-cols-3">
          <p>{TIMELINE_SENTENCE}</p>
          <p>{TEAM_TIME_SENTENCE}</p>
          <p>{AGREEMENT_SENTENCE}</p>
        </div>
      </Section>

      <Section eyebrow="Control" title="What you keep, and what you control" tone="paper-2">
        <IconGrid items={KEEP_CONTROL} />
      </Section>

      <Section eyebrow="The offer" title="How the amount is set">
        <div className="max-w-measure space-y-4 text-ink-2">
          <p>
            Our data partner looks at the systems and date ranges in scope, years of history, data volume and quality, and ownership and access terms.
          </p>
          <p className="text-ink">{INDICATIVE_RANGE}</p>
          <p>
            Our fit check never produces a dollar figure. We don&apos;t have our data partner&apos;s pricing model. {PARTNER_NAME} will walk you through
            our data partner&apos;s materials on the call. Have questions first?{" "}
            <Link href="/faq" className="link">
              Read the FAQ
            </Link>
            .
          </p>
        </div>
      </Section>

      <CTABand href="/qualify" />
      <JsonLd data={breadcrumbLd([{ name: "How it works", path: "/how-it-works" }])} />
    </>
  );
}
