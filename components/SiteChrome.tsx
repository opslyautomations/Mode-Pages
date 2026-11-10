import Link from "next/link";
import { DISCLOSURE, MAILING_ADDRESS, PARTNER_COMPANY, SITE_NAME } from "@/config/site";
import { ThresholdRuler } from "./ThresholdRuler";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="page-grid flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
          <Link href="/#chat" className="btn btn-primary !min-h-[40px] shrink-0 whitespace-nowrap !px-4 !py-2 text-sm" data-cta="header">
            Check my fit
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-paper-2 ">
      <div className="page-grid pt-10">
        <ThresholdRuler variant="divider" />
      </div>
      <div className="page-grid grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="font-serif text-lg font-semibold">{SITE_NAME}</p>
          <p className="mt-3 text-sm text-ink-2" data-disclosure>
            {DISCLOSURE}
          </p>
        </div>
        <nav aria-label="Legal" className="text-sm md:col-span-4">
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
