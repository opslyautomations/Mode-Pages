import Link from "next/link";
import { DISCLOSURE, MAILING_ADDRESS, PARTNER_COMPANY, SITE_NAME } from "@/config/site";
import { NICHES } from "@/content/niches";
import { ThresholdRuler } from "./ThresholdRuler";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="page-grid flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
          <Link href="/how-it-works" className="hidden px-3 py-2 text-ink-2 hover:text-ink md:inline-block">
            How it works
          </Link>
          <Link href="/faq" className="hidden px-3 py-2 text-ink-2 hover:text-ink md:inline-block">
            FAQ
          </Link>
          <Link href="/qualify" className="btn btn-primary !min-h-[40px] !px-4 !py-2 text-sm">
            Check my fit
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-paper-2 pb-24 md:pb-0">
      <div className="page-grid pt-10">
        <ThresholdRuler variant="divider" />
      </div>
      <div className="page-grid grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-serif text-lg font-semibold">{SITE_NAME}</p>
          <p className="mt-3 text-sm text-ink-2" data-disclosure>
            {DISCLOSURE}
          </p>
        </div>
        <nav aria-label="Industries" className="text-sm md:col-span-3">
          <p className="eyebrow mb-3">Industries</p>
          <ul className="space-y-2">
            {NICHES.map((n) => (
              <li key={n.slug}>
                <Link href={`/${n.slug}`} className="text-ink-2 hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/qualify?niche=other" className="text-ink-2 hover:text-ink">
                Other business or nonprofit
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Site" className="text-sm md:col-span-2">
          <p className="eyebrow mb-3">Site</p>
          <ul className="space-y-2">
            <li><Link href="/how-it-works" className="text-ink-2 hover:text-ink">How it works</Link></li>
            <li><Link href="/faq" className="text-ink-2 hover:text-ink">FAQ</Link></li>
            <li><Link href="/qualify" className="text-ink-2 hover:text-ink">Check my fit</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal" className="text-sm md:col-span-2">
          <p className="eyebrow mb-3">Legal</p>
          <ul className="space-y-2">
            <li><Link href="/disclosure" className="text-ink-2 hover:text-ink">Disclosure</Link></li>
            <li><Link href="/privacy" className="text-ink-2 hover:text-ink">Privacy</Link></li>
            <li><Link href="/terms" className="text-ink-2 hover:text-ink">Terms</Link></li>
          </ul>
        </nav>
      </div>
      <div className="page-grid border-t border-rule py-6 font-mono text-xs text-ink-2">
        © {new Date().getFullYear()} {PARTNER_COMPANY} · {MAILING_ADDRESS}
      </div>
    </footer>
  );
}
