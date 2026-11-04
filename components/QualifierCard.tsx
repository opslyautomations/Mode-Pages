"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Lock } from "lucide-react";
import {
  INDUSTRIES,
  LOCATIONS,
  OWNERSHIP,
  PRIOR_CONTACT,
  ROLES,
  SYSTEM_OPTIONS,
  YEARS,
  isFreeMail,
} from "@/lib/lead-schema";
import type { Reason, Tier } from "@/lib/scoring";
import { track } from "@/lib/analytics";
import { saveResult } from "@/lib/result-store";
import { ThresholdRuler } from "./ThresholdRuler";
import { EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT } from "@/config/site";

/* ------------------------------------------------------------------ state */

type State = {
  industry: string;
  industryLocked: boolean;
  location: string;
  deskEmployees: string;
  fieldEmployees: string;
  years: string;
  systems: string[];
  ownership: string;
  priorContact: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website: string;
  role: string;
  phone: string;
  emailConsent: boolean;
  smsConsent: boolean;
  fax: string;
};

type Action =
  | { type: "set"; field: keyof State; value: State[keyof State] }
  | { type: "toggleSystem"; value: string }
  | { type: "unlockIndustry" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "set":
      return { ...s, [a.field]: a.value };
    case "toggleSystem":
      return {
        ...s,
        systems: s.systems.includes(a.value) ? s.systems.filter((v) => v !== a.value) : [...s.systems, a.value],
      };
    case "unlockIndustry":
      return { ...s, industryLocked: false };
  }
}

/** Maps a niche slug (from the page or ?niche=) to the industry answer. */
const NICHE_TO_INDUSTRY: Record<string, string> = {
  "law-firms": "legal",
  "accounting-firms": "accounting",
  "marketing-agencies": "agency",
  "home-services": "home_services",
  other: "other",
};

type QId = "industry" | "location" | "desk" | "field" | "years" | "systems" | "ownership" | "prior" | "contact";
const ALL_QUESTIONS: QId[] = ["industry", "location", "desk", "field", "years", "systems", "ownership", "prior", "contact"];

/* -------------------------------------------------------------- component */

export function QualifierCard({ niche, episode }: { niche?: string; episode?: string }) {
  const router = useRouter();
  const presetIndustry = niche ? NICHE_TO_INDUSTRY[niche] : undefined;
  const [s, dispatch] = useReducer(reducer, {
    industry: presetIndustry ?? "",
    industryLocked: !!presetIndustry && presetIndustry !== "other",
    location: "",
    deskEmployees: "",
    fieldEmployees: "",
    years: "",
    systems: [],
    ownership: "",
    priorContact: "",
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    role: "",
    phone: "",
    emailConsent: false,
    smsConsent: false,
    fax: "",
  });

  const [perScreen, setPerScreen] = useState(1);
  const [screen, setScreen] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const started = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPerScreen(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const questions = useMemo(
    () => ALL_QUESTIONS.filter((q) => !(q === "industry" && s.industryLocked)),
    [s.industryLocked]
  );

  // Contact is always its own screen; questions are grouped perScreen at a time.
  const screens = useMemo(() => {
    const qs = questions.filter((q) => q !== "contact");
    const out: QId[][] = [];
    for (let i = 0; i < qs.length; i += perScreen) out.push(qs.slice(i, i + perScreen));
    out.push(["contact"]);
    return out;
  }, [questions, perScreen]);

  // Keep screen index valid when grouping changes (resize / unlock).
  const current = screens[Math.min(screen, screens.length - 1)];
  const isLast = current[0] === "contact";

  function markStarted() {
    if (!started.current) {
      started.current = true;
      track("qualifier_start", { niche: niche ?? "none", ep: episode ?? "" });
    }
  }

  function set<K extends keyof State>(field: K, value: State[K]) {
    markStarted();
    dispatch({ type: "set", field, value });
    if (errors[field as string]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate(ids: QId[]): Record<string, string> {
    const e: Record<string, string> = {};
    for (const q of ids) {
      if (q === "industry" && !s.industry) e.industry = "Choose your industry.";
      if (q === "location" && !s.location) e.location = "Choose where most of your team is based.";
      if (q === "desk" && (s.deskEmployees === "" || Number(s.deskEmployees) < 0 || !Number.isInteger(Number(s.deskEmployees))))
        e.deskEmployees = "Enter a whole number.";
      if (q === "field" && s.fieldEmployees !== "" && (Number(s.fieldEmployees) < 0 || !Number.isInteger(Number(s.fieldEmployees))))
        e.fieldEmployees = "Enter a whole number, or leave blank.";
      if (q === "years" && !s.years) e.years = "Choose how many years of records you have.";
      if (q === "ownership" && !s.ownership) e.ownership = "Choose one.";
      if (q === "prior" && !s.priorContact) e.priorContact = "Choose one.";
      if (q === "contact") {
        if (!s.firstName.trim()) e.firstName = "Required.";
        if (!s.lastName.trim()) e.lastName = "Required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) e.email = "Enter a valid work email.";
        if (!s.company.trim()) e.company = "Required.";
        if (!s.role) e.role = "Choose your role.";
        if (s.smsConsent && s.phone.replace(/\D/g, "").length < 10) e.phone = "Add a phone number to receive texts.";
      }
    }
    return e;
  }

  function next() {
    const e = validate(current);
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    markStarted();
    track(`qualifier_step_${screen + 1}`, { niche: niche ?? "none" });
    setScreen((i) => Math.min(i + 1, screens.length - 1));
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setScreen((i) => Math.max(0, i - 1));
  }

  async function submit() {
    const e = validate(["contact"]);
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            industry: s.industry,
            location: s.location,
            deskEmployees: Number(s.deskEmployees),
            fieldEmployees: s.fieldEmployees === "" ? undefined : Number(s.fieldEmployees),
            years: s.years,
            systems: s.systems,
            ownership: s.ownership,
            priorContact: s.priorContact,
          },
          contact: {
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            company: s.company,
            website: s.website,
            role: s.role,
            phone: s.phone,
            emailConsent: s.emailConsent,
            smsConsent: s.smsConsent,
          },
          niche: niche ?? undefined,
          episode: episode ?? undefined,
          pageUrl: window.location.href.slice(0, 500),
          fax: s.fax,
        }),
      });
      const data = (await res.json()) as {
        tier?: Tier;
        reasons?: Reason[];
        leadId?: string;
        manualReview?: boolean;
        emailSent?: boolean;
        error?: string;
      };
      if (!res.ok || !data.tier || !data.leadId) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      track("qualifier_complete", { tier: data.tier, niche: niche ?? s.industry, ep: episode ?? "" });
      saveResult({
        leadId: data.leadId,
        tier: data.tier,
        reasons: data.reasons ?? [],
        manualReview: !!data.manualReview,
        emailSent: !!data.emailSent,
        emailConsent: s.emailConsent,
        niche: niche ?? "",
        industry: s.industry,
        episode,
        prefill: {
          name: `${s.firstName} ${s.lastName}`.trim(),
          email: s.email.trim(),
          company: s.company.trim(),
          website: s.website.trim(),
          deskEmployees: Number(s.deskEmployees),
          years: YEARS.find((y) => y.value === s.years)?.label ?? s.years,
        },
      });
      router.push(`/result/${data.tier}?lead=${encodeURIComponent(data.leadId)}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const industryLabel = INDUSTRIES.find((i) => i.value === s.industry)?.label;

  return (
    <div ref={cardRef} className="rounded-card border border-rule bg-paper p-5 md:p-8">
      <ThresholdRuler variant="progress" step={Math.min(screen, screens.length)} total={screens.length} />

      {s.industryLocked && industryLabel && (
        <p className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper-2 px-3 py-1.5">
            <Lock className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />
            Industry: <strong className="font-semibold">{industryLabel}</strong>
          </span>
          <button
            type="button"
            className="link min-h-[32px]"
            onClick={() => {
              dispatch({ type: "unlockIndustry" });
              setScreen(0);
            }}
          >
            Change
          </button>
        </p>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) submit();
          else next();
        }}
        className="mt-6"
      >
        <div key={`${screen}-${perScreen}`} className="step-enter grid gap-8">
          {current.map((q) => (
            <Question key={q} id={q} s={s} set={set} dispatch={dispatch} errors={errors} />
          ))}
        </div>

        {/* Honeypot, hidden from people and assistive tech */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Fax
            <input type="text" tabIndex={-1} autoComplete="off" value={s.fax} onChange={(e) => set("fax", e.target.value)} />
          </label>
        </div>

        {serverError && (
          <p role="alert" className="mt-6 text-sm text-bad">
            {serverError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-6">
          {screen > 0 ? (
            <button type="button" onClick={back} className="btn btn-ghost" disabled={submitting}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
            {isLast ? (submitting ? "Checking…" : "See my result") : "Continue"}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {submitting ? "Checking your answers." : ""}
        </p>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- fields */

type QProps = {
  id: QId;
  s: State;
  set: <K extends keyof State>(field: K, value: State[K]) => void;
  dispatch: React.Dispatch<Action>;
  errors: Record<string, string>;
};

function FieldError({ msg, id }: { msg?: string; id: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-2 text-sm text-bad" role="alert">
      {msg}
    </p>
  );
}

function Radios({
  name,
  legend,
  help,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  help?: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="font-serif text-xl font-semibold">{legend}</legend>
      {help && <p className="mt-1 text-sm text-ink-2">{help}</p>}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-card border px-4 py-3 text-[15px] transition-colors ${
              value === o.value ? "border-accent bg-accent-soft" : "border-rule hover:border-ink-2"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError msg={error} id={`${name}-err`} />
    </fieldset>
  );
}

function NumberField({
  name,
  label,
  help,
  value,
  onChange,
  error,
  optional,
}: {
  name: string;
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-serif text-xl font-semibold">
        {label} {optional && <span className="font-sans text-sm font-normal text-ink-2">(optional)</span>}
      </label>
      {help && (
        <p id={`${name}-help`} className="mt-1 text-sm text-ink-2">
          {help}
        </p>
      )}
      <input
        id={name}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={[help ? `${name}-help` : "", error ? `${name}-err` : ""].filter(Boolean).join(" ") || undefined}
        className="mt-4 h-14 w-full max-w-[220px] rounded-card border border-rule bg-paper px-4 font-mono text-2xl num focus:border-accent"
      />
      <FieldError msg={error} id={`${name}-err`} />
    </div>
  );
}

function TextField({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  optional,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-ink-2">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        maxLength={200}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined}
        className="mt-1.5 h-12 w-full rounded-card border border-rule bg-paper px-3 focus:border-accent"
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1.5 text-sm text-warn">
          {hint}
        </p>
      )}
      <FieldError msg={error} id={`${name}-err`} />
    </div>
  );
}

function Question({ id, s, set, dispatch, errors }: QProps) {
  switch (id) {
    case "industry":
      return (
        <Radios name="industry" legend="What industry is your company in?" options={INDUSTRIES} value={s.industry} onChange={(v) => set("industry", v)} error={errors.industry} />
      );
    case "location":
      return (
        <Radios name="location" legend="Where is most of your team based?" options={LOCATIONS} value={s.location} onChange={(v) => set("location", v)} error={errors.location} />
      );
    case "desk":
      return (
        <NumberField
          name="deskEmployees"
          label="Full-time employees who work at a desk"
          help="Office, admin, professionals, managers. Not field crews."
          value={s.deskEmployees}
          onChange={(v) => set("deskEmployees", v)}
          error={errors.deskEmployees}
        />
      );
    case "field":
      return (
        <NumberField
          name="fieldEmployees"
          label="Field or non-desk employees"
          help={s.industry === "home_services" ? "Technicians, installers, crews. Counted separately from your desk team." : "Anyone who doesn't work at a desk. Leave blank if none."}
          value={s.fieldEmployees}
          onChange={(v) => set("fieldEmployees", v)}
          error={errors.fieldEmployees}
          optional
        />
      );
    case "years":
      return <Radios name="years" legend="Years of digital records" options={YEARS} value={s.years} onChange={(v) => set("years", v)} error={errors.years} />;
    case "systems":
      return (
        <fieldset>
          <legend className="font-serif text-xl font-semibold">Systems you use</legend>
          <p className="mt-1 text-sm text-ink-2">Select all that apply.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SYSTEM_OPTIONS.map((o) => {
              const on = s.systems.includes(o.value);
              return (
                <label
                  key={o.value}
                  className={`inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[15px] transition-colors ${
                    on ? "border-accent bg-accent-soft" : "border-rule hover:border-ink-2"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => dispatch({ type: "toggleSystem", value: o.value })} />
                  {on && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    case "ownership":
      return (
        <Radios name="ownership" legend="Whose systems hold your records?" options={OWNERSHIP} value={s.ownership} onChange={(v) => set("ownership", v)} error={errors.ownership} />
      );
    case "prior":
      return (
        <Radios
          name="priorContact"
          legend="Have you already talked to an AI data buyer or another referral partner about licensing your records?"
          help="We ask so no one wastes your time; buyers work with whoever introduced you first."
          options={PRIOR_CONTACT}
          value={s.priorContact}
          onChange={(v) => set("priorContact", v)}
          error={errors.priorContact}
        />
      );
    case "contact":
      return (
        <div>
          <p className="font-serif text-xl font-semibold">Where should we send your result?</p>
          <p className="mt-1 text-sm text-ink-2">Your result appears on the next screen. We never ask for files, records, or passwords.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField name="firstName" label="First name" autoComplete="given-name" value={s.firstName} onChange={(v) => set("firstName", v)} error={errors.firstName} />
            <TextField name="lastName" label="Last name" autoComplete="family-name" value={s.lastName} onChange={(v) => set("lastName", v)} error={errors.lastName} />
            <TextField
              name="email"
              label="Work email"
              type="email"
              autoComplete="email"
              value={s.email}
              onChange={(v) => set("email", v)}
              error={errors.email}
              hint={isFreeMail(s.email) ? "A work address helps us confirm your company. You can still continue." : undefined}
            />
            <TextField name="company" label="Company" autoComplete="organization" value={s.company} onChange={(v) => set("company", v)} error={errors.company} />
            <TextField name="website" label="Website" type="url" autoComplete="url" value={s.website} onChange={(v) => set("website", v)} optional />
            <div>
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                value={s.role}
                onChange={(e) => set("role", e.target.value)}
                aria-invalid={!!errors.role}
                className="mt-1.5 h-12 w-full rounded-card border border-rule bg-paper px-3 focus:border-accent"
              >
                <option value="">Select…</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.role} id="role-err" />
            </div>
            <TextField
              name="phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              value={s.phone}
              onChange={(v) => set("phone", v)}
              error={errors.phone}
              optional={!s.smsConsent}
            />
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <ConsentBox id="emailConsent" checked={s.emailConsent} onChange={(v) => set("emailConsent", v)} label={EMAIL_CONSENT_TEXT} />
            <ConsentBox id="smsConsent" checked={s.smsConsent} onChange={(v) => set("smsConsent", v)} label={SMS_CONSENT_TEXT} />
          </div>
        </div>
      );
  }
}

function ConsentBox({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--accent)]" />
      <span className="text-ink-2">{label}</span>
    </label>
  );
}
