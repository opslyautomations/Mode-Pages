import { DESK_MINIMUMS, ELIGIBILITY_LABELS, MIN_YEARS, type EligibilityKey } from "@/config/eligibility";

/**
 * Signature element. A thin measurement rule with tick marks.
 * - variant "thresholds": desk-employee minimums by category, current niche in accent.
 * - variant "progress": qualifier progress (step ticks, caret at current step).
 * - variant "divider": decorative footer rule.
 * Pure markup (no hooks) so it can render in server and client components.
 */

type ThresholdsProps = {
  variant?: "thresholds";
  highlight?: EligibilityKey;
  showYears?: boolean;
  caption?: string;
};
type ProgressProps = { variant: "progress"; step: number; total: number; label?: string };
type DividerProps = { variant: "divider" };

export type ThresholdRulerProps = ThresholdsProps | ProgressProps | DividerProps;

const SCALE_MAX = 40;

function Ticks({ count, majorEvery, height = 10 }: { count: number; majorEvery: number; height?: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-between" aria-hidden="true">
      {Array.from({ length: count + 1 }, (_, i) => (
        <span
          key={i}
          className="ruler-tick block w-px bg-rule"
          style={{
            height: i % majorEvery === 0 ? height : height / 2,
            transitionDelay: `${Math.min(i * 8, 400)}ms`,
            background: i % majorEvery === 0 ? "var(--ink-2)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function ThresholdRuler(props: ThresholdRulerProps) {
  if (props.variant === "divider") {
    return (
      <div className="relative h-3 w-full border-b border-rule" data-reveal aria-hidden="true">
        <Ticks count={60} majorEvery={10} height={10} />
      </div>
    );
  }

  if (props.variant === "progress") {
    const { step, total, label } = props;
    const pct = Math.min(100, Math.max(0, (step / total) * 100));
    return (
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={label ?? `Step ${step} of ${total}`}
        className="w-full"
      >
        <div className="mb-1 flex justify-between font-mono text-xs text-ink-2 num">
          <span>
            STEP {String(Math.min(step + 1, total)).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="relative h-4 border-b border-rule">
          <Ticks count={total * 4} majorEvery={4} height={10} />
          <div className="absolute bottom-0 left-0 h-[2px] bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }} />
          <span
            className="absolute -top-1 -translate-x-1/2 text-[10px] leading-none text-accent transition-[left] duration-200"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
      </div>
    );
  }

  const { highlight, showYears = true, caption } = props;
  const entries = (Object.keys(DESK_MINIMUMS) as EligibilityKey[])
    // medical shares the accounting threshold; merge labels at the same value
    .reduce<{ value: number; keys: EligibilityKey[] }[]>((acc, key) => {
      const value = DESK_MINIMUMS[key];
      const existing = acc.find((e) => e.value === value);
      if (existing) existing.keys.push(key);
      else acc.push({ value, keys: [key] });
      return acc;
    }, []);

  return (
    <figure className="w-full" data-reveal>
      <div className="mb-2 flex items-baseline justify-between font-mono text-xs text-ink-2">
        <span>MIN. FULL-TIME DESK EMPLOYEES</span>
        <span className="num">0 — {SCALE_MAX}+</span>
      </div>
      <div className="relative pb-20 pt-7">
        <div className="relative h-3 border-b border-ink-2">
          <Ticks count={SCALE_MAX} majorEvery={5} height={12} />
        </div>
        {entries.map(({ value, keys }, i) => {
          const active = highlight ? keys.includes(highlight) : false;
          const left = `${(value / SCALE_MAX) * 100}%`;
          const isLast = i === entries.length - 1;
          // Stagger alternate labels onto a second row so they never collide on phones.
          const labelPos = `${i % 2 === 1 ? "top-[4.25rem]" : "top-12"} ${
            isLast ? "-translate-x-full text-right pr-0" : "-translate-x-2 text-left"
          }`;
          return (
            <div key={value} className="absolute top-0" style={{ left }}>
              <span
                className={`absolute -translate-x-1/2 font-mono text-sm num ${active ? "text-accent font-semibold" : "text-ink-2"}`}
                style={{ top: 0 }}
              >
                {active ? "▼" : ""}
                {value}
              </span>
              <span
                className={`absolute top-6 block w-[2px] -translate-x-1/2 ${active ? "h-5 bg-accent" : "h-4 bg-ink-2"}`}
                aria-hidden="true"
              />
              <span
                className={`absolute w-32 text-xs leading-tight sm:w-44 ${labelPos} ${
                  active ? "font-semibold text-accent" : "text-ink-2"
                }`}
              >
                {keys.map((k) => ELIGIBILITY_LABELS[k]).join(" · ")}
              </span>
            </div>
          );
        })}
      </div>
      {showYears && (
        <p className="mt-2 font-mono text-xs text-ink-2">
          + <span className="text-ink">{MIN_YEARS}+ years</span> of digital records the company owns, for every category.
        </p>
      )}
      {caption && <figcaption className="mt-1 text-xs text-ink-2">{caption}</figcaption>}
      <span className="sr-only">
        Published minimums:{" "}
        {entries.map((e) => `${e.keys.map((k) => ELIGIBILITY_LABELS[k]).join(" and ")}: ${e.value} desk employees`).join("; ")}.
      </span>
    </figure>
  );
}
