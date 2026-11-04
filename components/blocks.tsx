import Link from "next/link";
import type { ReactNode } from "react";
import {
  Archive,
  BadgeDollarSign,
  CalendarRange,
  KeyRound,
  ListChecks,
  Settings2,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { DISCLOSURE, PARTNER_BIO, PARTNER_NAME, PARTNER_PHOTO, isTodo } from "@/config/site";
import { DESK_MINIMUMS, ELIGIBILITY_LABELS } from "@/config/eligibility";
import { NICHES } from "@/content/niches";
import { REGULATED_NOTE } from "@/content/shared";
import type { Niche } from "@/content/types";
import { ThresholdRuler } from "./ThresholdRuler";

const ICONS: Record<string, LucideIcon> = { Archive, BadgeDollarSign, CalendarRange, KeyRound, ListChecks, Settings2 };

/* -------------------------------------------------------------------------- */
export function HeroStatement({ eyebrow, h1, sub, cta }: { eyebrow?: string; h1: string; sub: string; cta: ReactNode }) {
  return (
    <section className="page-grid grid gap-8 pb-16 pt-14 md:grid-cols-12 md:pb-24 md:pt-24">
      <div className="md:col-span-10">
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="h1">{h1}</h1>
        <p className="mt-6 max-w-measure text-lg text-ink-2 md:text-xl">{sub}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">{cta}</div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
export function SpecSheet({
  leftHeader,
  rightHeader,
  rows,
  note,
}: {
  leftHeader: string;
  rightHeader: string;
  rows: { before: string; after: string }[];
  note?: string;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-rule">
      <table className="w-full text-left text-[15px]">
        <thead className="bg-paper-2">
          <tr>
            <th scope="col" className="w-1/2 border-b border-rule px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
              {leftHeader}
            </th>
            <th scope="col" className="w-1/2 border-b border-l border-rule px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
              {rightHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              <td className="border-b border-rule px-4 py-3">{r.before}</td>
              <td className="border-b border-l border-rule px-4 py-3 font-mono text-sm text-ink-2">{r.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="px-4 py-2 font-mono text-xs text-ink-2">{note}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function QuoteBlock({ quote, children }: { quote: string; children?: ReactNode }) {
  return (
    <div className="grid gap-8 md:grid-cols-12">
      <blockquote className="border-l-2 border-accent pl-6 font-serif text-2xl leading-snug md:col-span-6 md:text-3xl">
        {quote}
      </blockquote>
      {children && <div className="max-w-measure text-ink-2 md:col-span-6">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function IconGrid({ items }: { items: readonly { icon: string; title: string; body: string }[] }) {
  return (
    <ul className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const Icon = ICONS[it.icon] ?? Info;
        return (
          <li key={it.title} className="border-b border-r border-rule p-6">
            <Icon className="h-5 w-5 text-accent" aria-hidden="true" strokeWidth={1.75} />
            <h3 className="mt-4 font-sans text-base font-semibold tracking-normal">{it.title}</h3>
            <p className="mt-1 text-[15px] text-ink-2">{it.body}</p>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
export function NumberedTimeline({ steps }: { steps: readonly { title: string; body: string }[] }) {
  return (
    <div data-reveal>
      <div className="relative mb-6 hidden h-3 border-b border-rule md:block" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 flex justify-between">
          {Array.from({ length: steps.length * 6 + 1 }, (_, i) => (
            <span key={i} className="ruler-tick block w-px bg-rule" style={{ height: i % 6 === 0 ? 12 : 5, background: i % 6 === 0 ? "var(--ink-2)" : undefined }} />
          ))}
        </div>
      </div>
      <ol className="grid gap-0 md:grid-cols-5 md:gap-6">
        {steps.map((s, i) => (
          <li key={s.title} className="timeline-step relative border-l border-rule pb-8 pl-6 md:border-l-0 md:pb-0 md:pl-0">
            <span className="step-num block font-mono text-sm text-ink-2 num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 font-sans text-base font-semibold tracking-normal">{s.title}</h3>
            <p className="mt-1 text-[15px] text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 font-mono text-xs text-ink-2">~3 MONTHS FROM FIRST CONVERSATION TO PAYMENT, PER MODE.</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function AccordionFAQ({ faqs }: { faqs: readonly { q: string; a: string }[] }) {
  return (
    <div className="border-t border-rule">
      {faqs.map((f) => (
        <details key={f.q} className="group border-b border-rule">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-6 py-4 font-medium [&::-webkit-details-marker]:hidden">
            <span>{f.q}</span>
            <span className="font-mono text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="max-w-measure pb-6 text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function RegulatedNote() {
  return (
    <aside className="mt-8 flex gap-3 rounded-card border border-warn/40 bg-paper-2 p-5 text-[15px]" role="note">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
      <p>{REGULATED_NOTE}</p>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
export function NoticeBar({ children }: { children: ReactNode }) {
  return (
    <div className="border-y border-warn/40 bg-paper-2">
      <p className="page-grid flex gap-3 py-4 text-[15px]">
        <Info className="mt-1 h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
        <span>{children}</span>
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function Disclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-ink-2 ${className}`} data-disclosure>
      {DISCLOSURE}
    </p>
  );
}

export function DisclosurePanel() {
  const initials = isTodo(PARTNER_NAME)
    ? "—"
    : PARTNER_NAME.split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2);
  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-3">
        {PARTNER_PHOTO ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={PARTNER_PHOTO} alt={PARTNER_NAME} width={240} height={240} className="aspect-square w-40 rounded-card border border-rule object-cover md:w-full" loading="lazy" />
        ) : (
          <div className="flex aspect-square w-40 items-center justify-center rounded-card border border-rule bg-paper-2 font-serif text-4xl text-ink-2 md:w-full" aria-hidden="true">
            {initials}
          </div>
        )}
      </div>
      <div className="max-w-measure md:col-span-7">
        <p className="font-serif text-2xl font-semibold">{PARTNER_NAME}</p>
        <p className="mt-3 text-ink-2">{PARTNER_BIO}</p>
        <div className="mt-6 border-t border-rule pt-4">
          <p className="eyebrow mb-2">Disclosure</p>
          <Disclosure />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function CTABand({
  title = "Find out where your firm stands",
  sub = "Eight questions, about 90 seconds. You'll see an honest fit result, not a sales pitch.",
  href,
  label = "Check my fit",
  compact = false,
}: {
  title?: string;
  sub?: string;
  href: string;
  label?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="my-10 flex flex-col gap-4 rounded-card border border-rule bg-paper-2 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-xl font-semibold">{title}</p>
        <Link href={href} className="btn btn-primary shrink-0">
          {label}
        </Link>
      </div>
    );
  }
  return (
    <section className="border-t border-rule bg-ink text-paper">
      <div className="page-grid grid gap-6 py-16 md:grid-cols-12 md:items-end md:py-20">
        <div className="md:col-span-8">
          <h2 className="h2">{title}</h2>
          <p className="mt-3 max-w-measure opacity-80">{sub}</p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <Link href={href} className="btn bg-paper text-ink hover:opacity-90">
            {label}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
export function NicheSelector() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
      {NICHES.map((n) => (
        <li key={n.slug} className="bg-paper">
          <Link href={`/${n.slug}`} className="group flex h-full min-h-[180px] flex-col justify-between p-6 hover:bg-paper-2">
            <span className="font-serif text-xl font-semibold">{n.label}</span>
            <span className="mt-6 block">
              <span className="font-mono text-3xl text-accent num">{DESK_MINIMUMS[n.scoringKey]}+</span>
              <span className="block text-sm text-ink-2">desk employees · 3+ yrs records</span>
            </span>
          </Link>
        </li>
      ))}
      <li className="bg-paper">
        <Link href="/qualify?niche=other" className="flex h-full min-h-[180px] flex-col justify-between p-6 hover:bg-paper-2">
          <span className="font-serif text-xl font-semibold">Other business or nonprofit</span>
          <span className="mt-6 block">
            <span className="font-mono text-3xl text-accent num">{DESK_MINIMUMS.other}+</span>
            <span className="block text-sm text-ink-2">
              desk employees (medical: {DESK_MINIMUMS.medical}+)
            </span>
          </span>
        </Link>
      </li>
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
export function SystemsWall({ systems }: { systems: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Supported systems">
      {systems.map((s) => (
        <li key={s} className="rounded-full border border-rule px-4 py-2 font-mono text-sm">
          {s}
        </li>
      ))}
      <li className="rounded-full border border-dashed border-rule px-4 py-2 font-mono text-sm text-ink-2">+ many more</li>
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
export function CredibilityNotes({ notes }: { notes: { label: string; value: string; source: string }[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
      {notes.map((n) => (
        <div key={n.label} className="bg-paper p-5">
          <dt className="eyebrow">{n.label}</dt>
          <dd className="mt-2 text-[15px]">{n.value}</dd>
          <dd className="mt-1 font-mono text-xs text-ink-2">Source: {n.source}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
export function FitStrip({ niche, lastVerified }: { niche: Niche; lastVerified: string }) {
  return (
    <div className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-8">
        <ThresholdRuler
          highlight={niche.scoringKey}
          caption={`Minimums as published by Mode. Last confirmed ${lastVerified}.`}
        />
      </div>
      <ul className="space-y-3 text-[15px] md:col-span-4">
        {niche.fitNotes.map((f) => (
          <li key={f} className="flex gap-3 border-b border-rule pb-3">
            <span className="font-mono text-accent" aria-hidden="true">
              →
            </span>
            <span>{f}</span>
          </li>
        ))}
        <li className="sr-only">
          Your category: {ELIGIBILITY_LABELS[niche.scoringKey]}, minimum {DESK_MINIMUMS[niche.scoringKey]} desk employees.
        </li>
      </ul>
    </div>
  );
}
