import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyLeadToken } from "@/lib/lead-token";
import { postToWebhook } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  leadId: z.string().max(120),
  eventUri: z.string().url().max(300).optional(),
  inviteeUri: z.string().url().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`booked:${ip}`))) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const lead = await verifyLeadToken(parsed.data.leadId);
  if (!lead) return NextResponse.json({ ok: false }, { status: 400 });

  await postToWebhook({
    type: "status_update",
    status: "booked",
    leadId: parsed.data.leadId,
    leadShortId: lead.id,
    tier: lead.tier,
    eventUri: parsed.data.eventUri ?? null,
    inviteeUri: parsed.data.inviteeUri ?? null,
    at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
