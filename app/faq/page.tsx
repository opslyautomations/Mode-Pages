import type { Metadata } from "next";
import { GENERAL_FAQS } from "@/content/shared";
import { AccordionFAQ, CTABand, RegulatedNote } from "@/components/blocks";
import { JsonLd } from "@/components/ui";
import { breadcrumbLd, faqLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ: Licensing Company Records for AI Training",
  description:
    "Plain-English answers about Mode's company data licensing program: what's licensed, de-identification, passwords, how offers are set, cost, timeline, and how we're paid.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <div className="page-grid grid gap-10 py-12 md:grid-cols-12 md:py-20">
        <header className="md:col-span-4">
          <p className="eyebrow mb-4">FAQ</p>
          <h1 className="h2 md:text-5xl">Common questions</h1>
          <p className="mt-4 text-ink-2">Answers grounded in Mode&apos;s published terms. Mode makes all offers and decisions.</p>
        </header>
        <div className="md:col-span-8">
          <AccordionFAQ faqs={GENERAL_FAQS} />
          <RegulatedNote />
        </div>
      </div>
      <CTABand href="/qualify" />
      <JsonLd data={faqLd(GENERAL_FAQS)} />
      <JsonLd data={breadcrumbLd([{ name: "FAQ", path: "/faq" }])} />
    </>
  );
}
