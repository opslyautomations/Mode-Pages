import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { verifyLeadToken } from "@/lib/lead-token";
import { TIERS, type Tier } from "@/lib/scoring";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your Fit Result",
  description: "Your fit check result.",
  path: "/result",
  noindex: true,
});

type Props = {
  params: Promise<{ tier: string }>;
  searchParams: Promise<{ lead?: string }>;
};

export default async function ResultPage({ params, searchParams }: Props) {
  const { tier } = await params;
  if (!TIERS.includes(tier as Tier)) notFound();
  const { lead } = await searchParams;

  const verified = await verifyLeadToken(lead);
  // A token signed for another tier can't be used to unlock this one.
  if (verified && verified.tier !== tier) redirect(`/result/${verified.tier}?lead=${encodeURIComponent(lead!)}`);

  return (
    <div className="page-grid py-12 md:py-20">
      <ResultView tier={tier as Tier} verifiedLeadId={verified ? lead! : null} />
    </div>
  );
}
