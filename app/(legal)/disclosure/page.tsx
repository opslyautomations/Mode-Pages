import type { Metadata } from "next";
import { DISCLOSURE, PARTNER_COMPANY, PARTNER_EMAIL, PARTNER_NAME, SITE_NAME } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LEGAL_UPDATED, LegalPage } from "../LegalPage";

export const metadata: Metadata = pageMetadata({
  title: "Disclosure: How We're Paid",
  description: `${SITE_NAME} is run by an independent referral partner of an AI training-data company. Here's exactly how we're compensated.`,
  path: "/disclosure",
});

export default function DisclosurePage() {
  return (
    <LegalPage eyebrow="Disclosure" title="Who we are and how we're paid" updated={LEGAL_UPDATED}>
      <p className="text-lg text-ink" data-disclosure>
        {DISCLOSURE}
      </p>
      <h2>Who runs this site</h2>
      <p>
        {SITE_NAME} is a podcast and website operated by {PARTNER_COMPANY}. {PARTNER_NAME} is the person you&apos;ll speak with. We are an
        independent referral partner. We are not employed by our data partner and we are not our data partner&apos;s agent. We can&apos;t make offers, set prices, or
        approve eligibility on our data partner&apos;s behalf.
      </p>
      <h2>How the referral works</h2>
      <ul>
        <li>You complete our fit check. Your answers are recorded on this site first.</li>
        <li>If you&apos;re a strong or possible fit, you book a call with {PARTNER_NAME}.</li>
        <li>On that call, with your agreement, {PARTNER_NAME} registers your company with our data partner through our referral link.</li>
        <li>Our data partner then reviews your company directly and makes any offer. Our data partner makes all offers and decisions.</li>
        <li>We name our data partner on your call, before anything is registered, so you can review their terms yourself.</li>
      </ul>
      <h2>How we&apos;re paid</h2>
      <p>
        Our data partner compensates us when a company we referred completes a data licensing agreement. Your company pays us nothing, and there is no
        broker fee. If you don&apos;t sign an agreement, we aren&apos;t paid.
      </p>
      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t estimate what your records are worth. Our fit check returns a fit tier, never a number.</li>
        <li>We don&apos;t collect your records, files, samples, or passwords.</li>
        <li>We don&apos;t give legal, tax, or compliance advice. Firms with confidentiality duties should consult their own counsel.</li>
      </ul>
      <h2>Questions</h2>
      <p>Email {PARTNER_EMAIL}.</p>
    </LegalPage>
  );
}
