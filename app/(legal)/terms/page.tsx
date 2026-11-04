import type { Metadata } from "next";
import { DISCLOSURE, MAILING_ADDRESS, PARTNER_COMPANY, PARTNER_EMAIL, SITE_NAME } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LEGAL_UPDATED, LegalPage } from "../LegalPage";

// VERIFY with counsel before launch. Plain-English template generated from config values.

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: `Terms for using the ${SITE_NAME} website and fit check.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of use" updated={LEGAL_UPDATED}>
      <p>
        These terms cover your use of the {SITE_NAME} website, operated by {PARTNER_COMPANY}. By using the site you agree to them.
      </p>

      <h2>What this site is</h2>
      <p>{DISCLOSURE}</p>

      <h2>The fit check is informational</h2>
      <p>
        The fit check compares your answers with eligibility minimums Mode has published. It is not an offer, an approval, or a valuation, and
        it doesn&apos;t produce a dollar figure. Mode sets its own criteria, may change them at any time, and makes all offers and decisions.
        A &quot;strong fit&quot; result does not mean Mode will make an offer.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Nothing on this site is legal, tax, accounting, or compliance advice. Firms with professional confidentiality duties should have their
        own counsel review any data agreement before signing.
      </p>

      <h2>Your information</h2>
      <p>
        You agree to give accurate information and to only submit information about a company you&apos;re authorized to represent. See our
        privacy policy for how we handle it. Don&apos;t send us records, files, client data, or passwords.
      </p>

      <h2>Site content</h2>
      <p>
        We try to keep the content accurate and current, including eligibility thresholds, but we can&apos;t promise it is complete or error
        free. &quot;Mode&quot; is referred to by name only to describe the program; we are not affiliated with Mode beyond the referral
        relationship described above.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, {PARTNER_COMPANY} isn&apos;t liable for indirect or consequential losses arising from your use of the
        site. The site is provided as is.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version.</p>

      <h2>Contact</h2>
      <p>
        {PARTNER_COMPANY}, {MAILING_ADDRESS}, {PARTNER_EMAIL}
      </p>
    </LegalPage>
  );
}
