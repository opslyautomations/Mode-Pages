import { describe, expect, it } from "vitest";
import { score, industryToScoringKey } from "@/lib/scoring";
import { DESK_MINIMUMS } from "@/config/eligibility";
import type { Answers } from "@/lib/lead-schema";

const base: Answers = {
  industry: "legal",
  location: "us",
  deskEmployees: 20,
  years: "5_9",
  systems: ["m365", "pm"],
  ownership: "own",
  priorContact: "no",
};
const s = (o: Partial<Answers>) => score({ ...base, ...o });
const status = (o: Partial<Answers>, id: string) => s(o).reasons.find((r) => r.id === id)?.status;

describe("industry mapping", () => {
  it.each([
    ["legal", "legal"],
    ["accounting", "accounting_finance"],
    ["medical", "medical"],
    ["agency", "other"],
    ["home_services", "other"],
    ["other", "other"],
    ["nonprofit", "other"],
  ] as const)("%s -> %s", (industry, key) => expect(industryToScoringKey(industry)).toBe(key));
});

describe("baseline", () => {
  it("all checks pass -> strong", () => {
    const r = s({});
    expect(r.tier).toBe("strong");
    expect(r.manualReview).toBe(false);
    expect(r.reasons.every((x) => x.status === "pass")).toBe(true);
  });
});

describe("location", () => {
  it("US passes", () => expect(status({ location: "us" }, "location")).toBe("pass"));
  it("CA/UK/AU is possible", () => {
    expect(status({ location: "ca_uk_au" }, "location")).toBe("maybe");
    expect(s({ location: "ca_uk_au" }).tier).toBe("possible");
  });
  it.each(["eu", "elsewhere"] as const)("%s is not a fit", (location) => {
    expect(status({ location }, "location")).toBe("fail");
    expect(s({ location }).tier).toBe("not-yet");
  });
});

describe("desk employees vs minimum", () => {
  it.each([
    ["legal", DESK_MINIMUMS.legal],
    ["accounting", DESK_MINIMUMS.accounting_finance],
    ["medical", DESK_MINIMUMS.medical],
    ["agency", DESK_MINIMUMS.other],
    ["home_services", DESK_MINIMUMS.other],
    ["other", DESK_MINIMUMS.other],
    ["nonprofit", DESK_MINIMUMS.other],
  ] as const)("%s: at minimum passes, one below fails", (industry, min) => {
    expect(status({ industry, deskEmployees: min }, "desk")).toBe("pass");
    expect(s({ industry, deskEmployees: min }).tier).toBe("strong");
    expect(status({ industry, deskEmployees: min - 1 }, "desk")).toBe("fail");
    expect(s({ industry, deskEmployees: min - 1 }).tier).toBe("not-yet");
  });
});

describe("years of records", () => {
  it("<3 is not a fit", () => expect(s({ years: "lt3" }).tier).toBe("not-yet"));
  it("3-4 is possible", () => {
    expect(status({ years: "3_4" }, "years")).toBe("maybe");
    expect(s({ years: "3_4" }).tier).toBe("possible");
  });
  it.each(["5_9", "10_plus"] as const)("%s is strong", (years) => expect(s({ years }).tier).toBe("strong"));
});

describe("systems", () => {
  it("0 or 1 systems is not a fit", () => {
    expect(s({ systems: [] }).tier).toBe("not-yet");
    expect(s({ systems: ["m365"] }).tier).toBe("not-yet");
  });
  it("2+ systems passes", () => expect(status({ systems: ["m365", "chat", "crm"] }, "systems")).toBe("pass"));
});

describe("ownership", () => {
  it("own passes", () => expect(status({ ownership: "own" }, "ownership")).toBe("pass"));
  it("mixed is possible", () => expect(s({ ownership: "mixed" }).tier).toBe("possible"));
  it("client/franchisor-owned is possible with warning", () => {
    const r = s({ ownership: "client" });
    expect(r.tier).toBe("possible");
    expect(r.reasons.find((x) => x.id === "ownership")?.text).toMatch(/confirmed/);
  });
});

describe("prior contact", () => {
  it("no -> strong, no manual review", () => {
    expect(s({ priorContact: "no" }).manualReview).toBe(false);
  });
  it.each(["buyer", "partner"] as const)("%s -> possible + manual review", (priorContact) => {
    const r = s({ priorContact });
    expect(r.tier).toBe("possible");
    expect(r.manualReview).toBe(true);
  });
  it("unsure -> manual review without downgrading", () => {
    const r = s({ priorContact: "unsure" });
    expect(r.manualReview).toBe(true);
    expect(r.tier).toBe("strong");
  });
});

describe("tier = worst result", () => {
  it("fail beats possible", () => expect(s({ location: "ca_uk_au", years: "lt3" }).tier).toBe("not-yet"));
  it("possible beats strong", () => expect(s({ ownership: "mixed", years: "10_plus" }).tier).toBe("possible"));
});

describe("priority (internal)", () => {
  it("desk x years, x1.5 legal/accounting, x1.2 US", () => {
    expect(s({ deskEmployees: 10, years: "5_9" }).priority).toBe(Math.round(10 * 7 * 1.5 * 1.2 * 10) / 10);
    expect(s({ industry: "agency", deskEmployees: 40, years: "10_plus", location: "ca_uk_au" }).priority).toBe(400);
  });
  it("is never in visitor-facing reason text", () => {
    const r = s({});
    expect(r.reasons.some((x) => x.text.includes(String(r.priority)))).toBe(false);
  });
});

describe("no dollar output", () => {
  it("reasons never contain a dollar figure", () => {
    for (const industry of ["legal", "accounting", "agency", "home_services"] as const)
      for (const years of ["lt3", "3_4", "5_9", "10_plus"] as const)
        expect(s({ industry, years }).reasons.some((x) => x.text.includes("$"))).toBe(false);
  });
});
