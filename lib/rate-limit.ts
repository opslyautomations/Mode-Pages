/**
 * IP rate limiter. Uses Upstash Redis REST when UPSTASH_* env vars exist,
 * otherwise a best-effort in-memory window (per serverless instance).
 */

const WINDOW_SECONDS = 600;
const MAX_REQUESTS = 8;
const memory = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, max: number = MAX_REQUESTS): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", `rl:${key}`],
          ["EXPIRE", `rl:${key}`, WINDOW_SECONDS, "NX"],
        ]),
        cache: "no-store",
      });
      const data = (await res.json()) as { result: number }[];
      return (data[0]?.result ?? 0) <= max;
    } catch {
      // fall through to memory limiter
    }
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + WINDOW_SECONDS * 1000 });
    if (memory.size > 5000) {
      for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}
