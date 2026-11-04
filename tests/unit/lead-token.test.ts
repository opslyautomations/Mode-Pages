import { describe, expect, it } from "vitest";
import { newLeadId, signLeadToken, verifyLeadToken } from "@/lib/lead-token";

describe("lead tokens", () => {
  it("round-trips", async () => {
    const id = newLeadId();
    const t = await signLeadToken(id, "strong");
    expect(await verifyLeadToken(t)).toEqual({ id, tier: "strong" });
  });
  it("rejects a tier swap (not-yet -> strong)", async () => {
    const t = await signLeadToken(newLeadId(), "not-yet");
    const forged = t.replace(".not-yet.", ".strong.");
    expect(await verifyLeadToken(forged)).toBeNull();
  });
  it("rejects junk", async () => {
    expect(await verifyLeadToken("abc")).toBeNull();
    expect(await verifyLeadToken(undefined)).toBeNull();
  });
});
