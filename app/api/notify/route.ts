import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyLeadToken } from "@/lib/lead-token";
import { postToWebhook } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Tell me if thresholds change" opt-in for not-a-fit leads.
 * Only offered in the UI to visitors who already gave email consent.
 */
const schema = z.object({ leadId: z.string().max(120) });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`notify:${ip}`))) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  const lead = parsed.success ? await verifyLeadToken(parsed.data.leadId) : null;
  if (!lead) return NextResponse.json({ ok: false }, { status: 400 });

  await postToWebhook({
    type: "status_update",
    status: "notify_on_threshold_change",
    leadId: parsed.data!.leadId,
    leadShortId: lead.id,
    at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
