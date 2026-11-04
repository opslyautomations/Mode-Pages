import type { Metadata } from "next";
import { MAILING_ADDRESS, PARTNER_COMPANY, PARTNER_EMAIL, PARTNER_NAME, SITE_NAME } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LEGAL_UPDATED, LegalPage } from "../LegalPage";

// VERIFY with counsel before launch. Plain-English template generated from config values.

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects and uses the information you share in the fit check.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated={LEGAL_UPDATED}>
      <p>
        This site is operated by {PARTNER_COMPANY} (&quot;we&quot;). This policy explains what we collect when you use {SITE_NAME}, why, and
        your choices.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your fit-check answers: industry, location, employee counts, years of records, systems, ownership, and prior contact.</li>
        <li>Your contact details: name, work email, company, website, role, and phone if you give it.</li>
        <li>
          Consent records: which boxes you checked, the exact consent wording, its version, the time, and a one-way hash of your IP address
          (not the address itself).
        </li>
        <li>
          Referral source: a first-party cookie called <code>ref_attrib</code> that records how you first arrived (for example, which podcast
          episode or campaign link), for 90 days.
        </li>
        <li>Basic, aggregated analytics about page visits and fit-check progress, if analytics are enabled.</li>
      </ul>
      <p>
        We never ask for, and you should never send us, company records, files, samples, client data, or passwords.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To show you your fit result and follow up about your inquiry.</li>
        <li>To prepare for your call with {PARTNER_NAME}.</li>
        <li>
          With your agreement on that call, to register your company with our data partner as our referral. Our data partner then handles your company&apos;s
          information under its own privacy terms.
        </li>
        <li>To record which referral partner introduced you first, as our data partner credits the first partner to submit a company.</li>
      </ul>

      <h2>Who we share it with</h2>
      <ul>
        <li>Our data partner, as described above, only after you agree.</li>
        <li>Service providers that run this site for us: hosting, our CRM, email delivery, scheduling (Calendly), and analytics.</li>
        <li>Authorities, if the law requires it.</li>
      </ul>
      <p>We don&apos;t sell your personal information.</p>

      <h2>Email and text messages</h2>
      <p>
        We only email or text you if you checked the matching box. Every email includes a way to unsubscribe. Reply STOP to any text to opt out.
        Message and data rates may apply.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep inquiry records for as long as needed to follow up and to document referral credit, then delete or anonymize them. You can ask
        us to delete your information at any time.
      </p>

      <h2>Your choices</h2>
      <p>
        To access, correct, or delete your information, email {PARTNER_EMAIL}. You can clear the <code>ref_attrib</code> cookie in your browser
        settings at any time.
      </p>

      <h2>Contact</h2>
      <p>
        {PARTNER_COMPANY}
        <br />
        {MAILING_ADDRESS}
        <br />
        {PARTNER_EMAIL}
      </p>
    </LegalPage>
  );
}
