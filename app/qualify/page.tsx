import type { Metadata } from "next";
import { getNiche } from "@/content/niches";
import { QualifierCard } from "@/components/QualifierCard";
import { Disclosure } from "@/components/blocks";
import { ThresholdRuler } from "@/components/ThresholdRuler";
import { ELIGIBILITY_LAST_VERIFIED } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Check If Your Firm Qualifies: 90-Second Fit Check",
  description:
    "Eight questions, about 90 seconds. Find out whether your company is a strong fit, a possible fit, or not a fit right now for our data partner's company data licensing program.",
  path: "/qualify",
});

type Props = { searchParams: Promise<{ niche?: string; ep?: string }> };

export default async function QualifyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const niche = sp.niche === "other" ? "other" : getNiche(sp.niche)?.slug;
  const ep = sp.ep && /^\d{1,5}$/.test(sp.ep) ? sp.ep : undefined;
  const nicheObj = getNiche(niche);

  return (
    <div className="page-grid grid gap-12 py-12 md:grid-cols-12 md:py-20">
      <div className="md:col-span-4">
        <p className="eyebrow mb-4">90-second fit check</p>
        <h1 className="h2 md:text-5xl">Check if your firm qualifies</h1>
        <p className="mt-4 text-ink-2">
          Eight quick questions. You&apos;ll get an honest result: strong fit, possible fit, or not a fit right now. No dollar estimates, ever.
        </p>
        <div className="mt-10">
          <ThresholdRuler highlight={nicheObj?.scoringKey} showYears caption={`Minimums as published by our data partner. Last confirmed ${ELIGIBILITY_LAST_VERIFIED}.`} />
        </div>
        <Disclosure className="mt-8 border-t border-rule pt-6" />
      </div>
      <div className="md:col-span-8">
        <QualifierCard niche={niche} episode={ep} />
      </div>
    </div>
  );
}
