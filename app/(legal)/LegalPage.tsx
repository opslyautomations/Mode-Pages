import type { ReactNode } from "react";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <article className="page-grid py-12 md:py-20">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h1 className="h2 md:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-xs text-ink-2">Last updated {updated}</p>
      <div className="prose-ledger mt-10 max-w-measure space-y-4 [&_h2]:font-serif [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">{children}</div>
    </article>
  );
}

export const LEGAL_UPDATED = "November 4, 2026";
