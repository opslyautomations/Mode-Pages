import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { BASE_URL, SITE_NAME, warnMissingConfig } from "@/config/site";
import { NICHES } from "@/content/niches";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { RevealObserver } from "@/components/RevealObserver";
import { CtaTracker } from "@/components/CtaTracker";
import { JsonLd } from "@/components/ui";
import { organizationLd } from "@/lib/seo";

// Variable Fraunces with the optical-size axis; headings set weight 600 in globals.css.
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap", axes: ["opsz"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

warnMissingConfig();
for (const n of NICHES) {
  if (n.episode.episodeTitle.startsWith("TODO_") || !n.episode.embedUrl) {
    console.warn(`⚠️  [content] /content/niches/${n.slug}.ts: episode metadata, embed URL, or transcript still TODO.`);
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Find out whether your firm qualifies for Mode's company data licensing program. A 90-second fit check from an independent referral partner.",
  openGraph: { siteName: SITE_NAME, locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

const PLAUSIBLE = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:p-3">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={organizationLd()} />
        <RevealObserver />
        <CtaTracker />
        {PLAUSIBLE && <Script defer data-domain={PLAUSIBLE} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />}
        {!PLAUSIBLE && GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
