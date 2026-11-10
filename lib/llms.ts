import { BASE_URL, DISCLOSURE, INDICATIVE_RANGE, SITE_NAME } from "@/config/site";
import { DESK_MINIMUMS, MIN_YEARS } from "@/config/eligibility";
import { NICHES } from "@/content/niches";
import { AGREEMENT_SENTENCE, GENERAL_FAQS, PROCESS_STEPS, REGULATED_NOTE, TEAM_TIME_SENTENCE, TIMELINE_SENTENCE } from "@/content/shared";

/** llms.txt / llms-full.txt, generated at build from the niche registry. */
export function buildLlmsTxt(full: boolean): string {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`, "");
  lines.push(
    `> ${SITE_NAME} helps companies find out whether they qualify for our data partner's company data licensing program, in which our data partner buys a de-identified, licensed copy of a company's historical operating records (email, documents, chat, CRM, billing) to supply AI labs training workplace agents. Companies keep their originals and systems, share no passwords, and pay no broker fee.`,
    ""
  );
  lines.push(`Disclosure: ${DISCLOSURE}`, "");

  lines.push("## Eligibility by industry", "");
  for (const n of NICHES) {
    lines.push(`- ${n.label}: ${DESK_MINIMUMS[n.scoringKey]}+ full-time desk employees and ${MIN_YEARS}+ years of digital records the company owns.`);
  }
  lines.push(`- Medical / dental: ${DESK_MINIMUMS.medical}+ desk employees. Other businesses and nonprofits: ${DESK_MINIMUMS.other}+.`, "");

  lines.push("## Process", "");
  PROCESS_STEPS.forEach((s, i) => lines.push(`${i + 1}. ${s.title}: ${s.body}`));
  lines.push("", TIMELINE_SENTENCE, TEAM_TIME_SENTENCE, AGREEMENT_SENTENCE, "", INDICATIVE_RANGE, "");

  lines.push("## Key pages", "");
  lines.push(`- [Fit check chat and booking](${BASE_URL}/#chat)`);
  lines.push(`- [Disclosure](${BASE_URL}/disclosure)`, "");

  if (full) {
    lines.push("## General FAQ", "");
    for (const f of GENERAL_FAQS) lines.push(`### ${f.q}`, "", f.a, "");
    for (const n of NICHES) {
      lines.push(`## ${n.label}`, "", n.hero.sub, "", `Records: ${n.records.join("; ")}.`, "", `Fit notes: ${n.fitNotes.join(" ")}`, "");
      for (const f of n.faqs) lines.push(`### ${f.q}`, "", f.a, "");
      if (n.regulated) lines.push(REGULATED_NOTE, "");
    }
  }
  return lines.join("\n");
}
