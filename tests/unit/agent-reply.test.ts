import { describe, expect, it } from "vitest";
import { BOOK_MARKER, cleanAgentReply } from "@/lib/agent-reply";
import { SITE_NAME } from "@/config/site";

describe("cleanAgentReply", () => {
  it("detects and strips the booking marker", () => {
    const r = cleanAgentReply(`You look like a strong fit.\n${BOOK_MARKER}`);
    expect(r.qualified).toBe(true);
    expect(r.text).toBe("You look like a strong fit.");
  });

  it("is not qualified without the marker", () => {
    expect(cleanAgentReply("Tell me more about your systems.").qualified).toBe(false);
  });

  it("never shows the buyer's name or domains", () => {
    const r = cleanAgentReply("I'm the assistant for the Mode Referral Program. See mode.inc. Mode buys records.");
    expect(r.text).toContain(SITE_NAME);
    expect(/\bMode\b/.test(r.text)).toBe(false);
    expect(r.text.toLowerCase()).not.toContain("mode.inc");
  });

  it("capitalises the replacement at the start of a sentence", () => {
    expect(cleanAgentReply("Thanks. Mode runs the program, and Mode pays you.").text).toBe(
      "Thanks. Our data partner runs the program, and our data partner pays you."
    );
  });

  it("turns light markdown into plain text", () => {
    const r = cleanAgentReply("**Confirmed**\n- 12 employees\n- US based");
    expect(r.text).toBe("Confirmed\n• 12 employees\n• US based");
  });
});
