import { NextResponse, type NextRequest } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { score } from "@/lib/scoring";
import { hashIp, newLeadId, signLeadToken } from "@/lib/lead-token";
import { rateLimit } from "@/lib/rate-limit";
import { ATTRIB_COOKIE, decodeAttribution } from "@/lib/attribution";
import { buildFollowUpEmail, postToWebhook, sendFallbackEmail, sendFollowUpEmail } from "@/lib/notify";
import { CONSENT_VERSION, EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!(await rateLimit(`qualify:${ip}`))) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: pretend success, store nothing.
  if (body && typeof body === "object" && "fax" in body && (body as { fax?: unknown }).fax) {
    return NextResponse.json({ tier: "not-yet", reasons: [], leadId: "L0.not-yet.x" });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const lead = parsed.data;
  const result = score(lead.answers);
  const id = newLeadId();
  const leadId = await signLeadToken(id, result.tier);
  const now = new Date().toISOString();
  const ipHash = await hashIp(ip);
  const attribution = decodeAttribution(req.cookies.get(ATTRIB_COOKIE)?.value);

  const payload = {
    type: "lead",
    leadId,
    leadShortId: id,
    submittedAt: now,
    tier: result.tier,
    reasons: result.reasons,
    priority: result.priority,
    manualReview: result.manualReview,
    scoringKey: result.scoringKey,
    deskMinimum: result.deskMinimum,
    niche: lead.niche ?? attribution.niche ?? null,
    episode: lead.episode ?? attribution.ep ?? null,
    pageUrl: lead.pageUrl ?? null,
    answers: lead.answers,
    contact: {
      firstName: lead.contact.firstName,
      lastName: lead.contact.lastName,
      email: lead.contact.email,
      company: lead.contact.company,
      website: lead.contact.website || null,
      role: lead.contact.role,
      phone: lead.contact.phone || null,
    },
    consent: {
      version: CONSENT_VERSION,
      ipHash,
      email: lead.contact.emailConsent ? { granted: true, text: EMAIL_CONSENT_TEXT, at: now } : { granted: false },
      sms: lead.contact.smsConsent ? { granted: true, text: SMS_CONSENT_TEXT, at: now } : { granted: false },
    },
    attribution,
    followUpEmail: lead.contact.emailConsent ? buildFollowUpEmail(lead.contact.firstName, result.tier) : null,
  };

  const forwarded = await postToWebhook(payload);
  if (!forwarded) {
    console.error("[qualify] webhook failed twice; lead logged here", JSON.stringify(payload));
    await sendFallbackEmail(payload);
  }

  let emailSent = false;
  if (lead.contact.emailConsent) {
    emailSent = await sendFollowUpEmail(lead.contact.email, lead.contact.firstName, result.tier);
  }

  return NextResponse.json({
    tier: result.tier,
    reasons: result.reasons,
    manualReview: result.manualReview,
    leadId,
    emailSent,
  });
}
