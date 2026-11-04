import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BANNED_PHRASES, FORBIDDEN_DOMAINS } from "@/config/banned-phrases";

const ROOT = path.resolve(__dirname, "../..");
const SCAN_DIRS = ["content", "app", "components", "lib", "config"];
const SKIP = new Set([path.join(ROOT, "config/banned-phrases.ts")]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.(tsx?|md|txt)$/.test(e.name) && !SKIP.has(p) ? [p] : [];
  });
}

const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));

describe("banned phrases", () => {
  it("scans a non-trivial number of files", () => expect(files.length).toBeGreaterThan(20));

  it.each(BANNED_PHRASES.map((p) => [p]))("never uses %j", (phrase) => {
    const hits = files.filter((f) => fs.readFileSync(f, "utf8").toLowerCase().includes(phrase.toLowerCase()));
    expect(hits.map((h) => path.relative(ROOT, h))).toEqual([]);
  });
});

describe("forbidden domains in source", () => {
  it.each(FORBIDDEN_DOMAINS.map((d) => [d]))("source never references %s", (domain) => {
    const all = [...files, path.join(ROOT, "next.config.ts")];
    const hits = all.filter((f) => fs.readFileSync(f, "utf8").toLowerCase().includes(domain));
    // config/eligibility.ts carries the source comment required by the brief.
    expect(hits.map((h) => path.relative(ROOT, h)).filter((h) => h !== "config/eligibility.ts")).toEqual([]);
  });
});

describe("dollar figures", () => {
  it("only the published-range sentence contains a dollar amount", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      for (const m of text.matchAll(/\$\s?\d[\d,.]*\s?[KMB]?/g)) {
        const around = text.slice(Math.max(0, m.index! - 40), m.index! + 20);
        if (!around.includes("$100K–$5M")) offenders.push(`${path.relative(ROOT, f)}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
