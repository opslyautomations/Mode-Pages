import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyLeadToken } from "@/lib/lead-token";
import { pageMetadata } from "@/lib/seo";
import { BookClient } from "./BookClient";
import { PARTNER_NAME } from "@/config/site";
import { Disclosure } from "@/components/blocks";

export const metadata: Metadata = pageMetadata({
  title: "Book Your Call",
  description: "Book a 15-minute call.",
  path: "/book",
  noindex: true,
});

type Props = { searchParams: Promise<{ lead?: string }> };

/** Calendar is only for verified strong/possible leads; everyone else goes to /qualify. */
export default async function BookPage({ searchParams }: Props) {
  const { lead } = await searchParams;
  const verified = await verifyLeadToken(lead);
  if (!verified || verified.tier === "not-yet") redirect("/qualify");

  return (
    <div className="page-grid py-12 md:py-20">
      <p className="eyebrow mb-4">Book your call</p>
      <h1 className="h2 md:text-5xl">A 15-minute call with {PARTNER_NAME}</h1>
      <p className="mt-4 max-w-measure text-ink-2">
        We&apos;ll confirm your details and, if everything checks out, introduce you to Mode for an estimate and a 14-day nonbinding letter of
        intent.
      </p>
      <div className="mt-10">
        <BookClient leadId={lead!} tier={verified.tier} />
      </div>
      <Disclosure className="mt-10 max-w-measure border-t border-rule pt-6" />
    </div>
  );
}
