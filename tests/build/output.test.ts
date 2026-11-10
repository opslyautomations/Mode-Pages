/**
 * Run after `next build` (npm run test:build). Scans the prerendered output.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FORBIDDEN_DOMAINS } from "@/config/banned-phrases";
import { DISCLOSURE } from "@/config/site";

const ROOT = path.resolve(__dirname, "../..");
const APP_OUT = path.join(ROOT, ".next/server/app");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(html|rsc|body|meta|json|txt|xml)$/.test(e.name) ? [p] : [];
  });
}

const built = fs.existsSync(APP_OUT);
const files = walk(APP_OUT);
const decode = (s: string) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe.skipIf(!built)("built output", () => {
  it("has prerendered HTML", () => expect(files.some((f) => f.endsWith(".html"))).toBe(true));

  it.each(FORBIDDEN_DOMAINS.map((d) => [d]))("no href/src/action/redirect/JSON-LD URL contains %s", (domain) => {
    const hits = files.filter((f) => fs.readFileSync(f, "utf8").toLowerCase().includes(domain));
    expect(hits.map((h) => path.relative(ROOT, h))).toEqual([]);
  });

  it("never names the buyer: no standalone word \"Mode\" in any built page, feed, or llms.txt", () => {
    const hits = files.filter((f) => /\bMode\b/.test(fs.readFileSync(f, "utf8")));
    expect(hits.map((h) => path.relative(ROOT, h))).toEqual([]);
  });

  it("routes manifest redirects never point at a forbidden domain", () => {
    const manifest = path.join(ROOT, ".next/routes-manifest.json");
    const text = fs.readFileSync(manifest, "utf8").toLowerCase();
    for (const d of FORBIDDEN_DOMAINS) expect(text.includes(d)).toBe(false);
  });

  it("the single page renders the disclosure and the chat", () => {
    const html = decode(fs.readFileSync(path.join(APP_OUT, "index.html"), "utf8"));
    expect(html).toContain(decode(DISCLOSURE));
    expect(html).toContain('id="chat"');
  });

  it("only the landing page and legal pages are built as pages", () => {
    const pages = files
      .filter((f) => f.endsWith(".html"))
      .map((f) => path.relative(APP_OUT, f))
      .filter((f) => !f.startsWith("_"))
      .sort();
    expect(pages).toEqual(["disclosure.html", "index.html", "privacy.html", "terms.html"]);
  });
});
