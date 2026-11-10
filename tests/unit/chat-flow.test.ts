import { describe, expect, it } from "vitest";
import { STEPS, localParse, looksLikeQuestion, validateAnswer } from "@/lib/chat-flow";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";
import { BANNED_PHRASES } from "@/config/banned-phrases";

describe("chat flow local parsing", () => {
  it("parses plain numbers and short phrases for desk employees", () => {
    expect(localParse(STEPS.deskEmployees, "25")).toBe("25");
    expect(localParse(STEPS.deskEmployees, "about 1,200 people")).toBe("1200");
    expect(localParse(STEPS.deskEmployees, "how many do I need?")).toBeNull();
  });

  it("matches choice labels and values case-insensitively", () => {
    expect(localParse(STEPS.industry, "legal")).toBe("legal");
    expect(localParse(STEPS.location, "United States")).toBe("us");
    expect(localParse(STEPS.location, "we're mostly in Ohio")).toBeNull();
  });

  it("parses multi-select lists only when every item matches", () => {
    expect(localParse(STEPS.systems, "Slack or Teams, ServiceTitan")).toBe("chat,servicetitan");
    expect(localParse(STEPS.systems, "gmail and some other stuff")).toBeNull();
  });

  it("requires a first and last name, and a valid email", () => {
    expect(localParse(STEPS.name, "Jane")).toBeNull();
    expect(localParse(STEPS.name, "Jane Doe")).toBe("Jane Doe");
    expect(localParse(STEPS.email, "jane@firm.com")).toBe("jane@firm.com");
    expect(localParse(STEPS.email, "jane at firm")).toBeNull();
  });

  it("never treats a question as an answer", () => {
    expect(looksLikeQuestion("Do you need our passwords?")).toBe(true);
    expect(localParse(STEPS.company, "What do you do with this?")).toBeNull();
  });
});

describe("validating model answers", () => {
  it("rejects values outside the step's options", () => {
    expect(validateAnswer(STEPS.ownership, "own")).toBe("own");
    expect(validateAnswer(STEPS.ownership, "yes")).toBeNull();
    expect(validateAnswer(STEPS.systems, "m365,crm")).toBe("m365,crm");
    expect(validateAnswer(STEPS.systems, "m365,notion")).toBeNull();
    expect(validateAnswer(STEPS.deskEmployees, "twenty")).toBeNull();
  });

  it("never accepts consent from the model", () => {
    expect(localParse(STEPS.emailConsent, "sure, email me")).toBeNull();
  });
});

describe("chat system prompt", () => {
  it("lists banned phrases only as things to avoid and never names the buyer", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("Never use these phrases");
    expect(/\bMode\b/.test(CHAT_SYSTEM_PROMPT)).toBe(false);
    for (const p of BANNED_PHRASES) {
      const withoutRuleLine = CHAT_SYSTEM_PROMPT.split("\n").filter((l) => !l.includes("Never use these phrases")).join("\n");
      expect(withoutRuleLine.toLowerCase()).not.toContain(p);
    }
  });
});
