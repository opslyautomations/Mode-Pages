import type { ReactNode } from "react";

/** Section wrapper: thin top rule, consistent rhythm, optional eyebrow + heading. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
  tone = "paper",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "paper-2";
}) {
  return (
    <section id={id} className={`border-t border-rule ${tone === "paper-2" ? "bg-paper-2" : ""} ${className}`}>
      <div className="page-grid py-16 md:py-24" data-reveal>
        {(eyebrow || title || intro) && (
          <header className="mb-10 grid gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
              {title && <h2 className="h2">{title}</h2>}
              {intro && <div className="mt-4 max-w-measure text-ink-2">{intro}</div>}
            </div>
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

/** Renders "markdown-lite": blank-line paragraphs and "## " headings. Text only, no HTML injection. */
export function TextBlocks({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div className={`prose-ledger max-w-measure ${className}`}>
      {blocks.map((b, i) =>
        b.startsWith("## ") ? (
          <h2 key={i} className="font-serif">
            {b.slice(3)}
          </h2>
        ) : (
          <p key={i}>{b}</p>
        )
      )}
    </div>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
