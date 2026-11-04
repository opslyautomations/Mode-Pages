import type { Tier } from "./scoring";

/**
 * Stateless signed lead IDs: `<id>.<tier>.<sig>`.
 * Lets /book and the result pages verify that a visitor actually qualified
 * (strong or possible) without a database. Server-only.
 */

const DEV_SECRET = "dev-only-insecure-secret-change-me";

function secret(): string {
  const s = process.env.LEAD_SIGNING_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    console.warn("[lead-token] LEAD_SIGNING_SECRET is not set. Using an insecure development secret.");
  }
  return s || DEV_SECRET;
}

function b64url(bytes: ArrayBuffer): string {
  return Buffer.from(bytes).toString("base64url");
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64url(sig).slice(0, 22);
}

export function newLeadId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return "L" + Buffer.from(bytes).toString("base64url");
}

export async function signLeadToken(id: string, tier: Tier): Promise<string> {
  return `${id}.${tier}.${await hmac(`${id}.${tier}`)}`;
}

export async function verifyLeadToken(token: string | null | undefined): Promise<{ id: string; tier: Tier } | null> {
  if (!token || token.length > 120) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, tier, sig] = parts;
  if (tier !== "strong" && tier !== "possible" && tier !== "not-yet") return null;
  const expected = await hmac(`${id}.${tier}`);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? { id, tier } : null;
}

export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT || "ip-salt-unset";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Buffer.from(digest).toString("hex");
}
