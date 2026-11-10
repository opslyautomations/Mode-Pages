import type { Metadata } from "next";
import { Archive, BadgeDollarSign, KeyRound } from "lucide-react";
import { DISCLOSURE, PARTNER_NAME, SITE_NAME } from "@/config/site";
import { DESK_MINIMUMS, MIN_YEARS } from "@/config/eligibility";
import { Section, JsonLd } from "@/components/ui";
import { AccordionFAQ, NumberedTimeline, SpecSheet } from "@/components/blocks";
import { ChatQualifier } from "@/components/ChatQualifier";
import { ThresholdRuler } from "@/components/ThresholdRuler";
import { GENERAL_FAQS, PROCESS_STEPS, RECORD_CATEGORIES } from "@/content/shared";
import { faqLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME}: License Company Records for AI Training`,
  description:
    "AI labs are paying for real examples of how professionals work. Chat with our assistant for two minutes to see if your company may qualify, then book a call.",
  path: "/",
});

const POINTS = [
  { icon: Archive, text: "You license a copy. Originals and systems stay with you." },
  { icon: KeyRound, text: "No passwords handed over. Your team signs in itself." },
  { icon: BadgeDollarSign, text: "No broker fee. You pay us nothing." },
];

const MINIMUMS = [
  { label: "Legal", value: `${DESK_MINIMUMS.legal}+` },
  { label: "Accounting & finance", value: `${DESK_MINIMUMS.accounting_finance}+` },
  { label: "Medical & dental", value: `${DESK_MINIMUMS.medical}+` },
  { label: "Everyone else", value: `${DESK_MINIMUMS.other}+` },
];

export default function HomePage() {
  return (
    <>
      <section className="page-grid grid gap-8 py-10 md:py-16 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0">
        <div className="lg:col-span-5 lg:pt-6">
          <p className="eyebrow mb-4">{SITE_NAME} · Company data licensing</p>
          <h1 className="h1">Your firm&apos;s operating history may be worth more than you think.</h1>
          <p className="mt-6 max-w-measure text-lg text-ink-2">
            AI labs are paying for real examples of how professionals work. Our data partner buys a de-identified copy of company records. Chat with
            our assistant for two minutes to see if you may qualify, then book a call with {PARTNER_NAME}.
          </p>
        </div>

        <div id="chat" className="scroll-mt-20 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          <ChatQualifier />
          <p className="mt-3 text-xs text-ink-2" data-disclosure>
            {DISCLOSURE}
          </p>
        </div>

        <div className="lg:col-span-5 lg:pt-8">
          <ul className="space-y-3">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-[15px]">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-rule pt-6">
            <p className="eyebrow mb-3">Published minimums · full-time desk employees</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-2">
              {MINIMUMS.map((m) => (
                <div key={m.label}>
                  <dt className="text-xs text-ink-2">{m.label}</dt>
                  <dd className="num font-mono text-xl">{m.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-ink-2">Every category also needs {MIN_YEARS}+ years of digital records your company owns.</p>
          </div>
        </div>
      </section>

      <div className="page-grid">
        <ThresholdRuler variant="divider" />
      </div>

      <Section eyebrow="What counts" title="What counts as operating records" intro="Our data partner licenses a copy of everyday work records. You choose which are in scope.">
        <SpecSheet leftHeader="Category" rightHeader="Examples" rows={RECORD_CATEGORIES} />
      </Section>

      <Section eyebrow="The process" title="From first call to payment in about three months" tone="paper-2">
        <NumberedTimeline steps={PROCESS_STEPS} />
      </Section>

      <Section eyebrow="Questions" title="Common questions">
        <AccordionFAQ faqs={GENERAL_FAQS} />
        <p className="mt-10">
          <a href="#chat" className="btn btn-primary" data-cta="faq-chat">
            Start the fit check
          </a>
        </p>
      </Section>

      <JsonLd data={faqLd(GENERAL_FAQS)} />
    </>
  );
}
