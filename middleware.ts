import { NextResponse, type NextRequest } from "next/server";
import { ATTRIB_COOKIE, ATTRIB_MAX_AGE, buildAttribution, encodeAttribution } from "@/lib/attribution";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get(ATTRIB_COOKIE)) {
    const attribution = buildAttribution(req.nextUrl, req.headers.get("referer"));
    res.cookies.set(ATTRIB_COOKIE, encodeAttribution(attribution), {
      maxAge: ATTRIB_MAX_AGE,
      sameSite: "lax",
      path: "/",
      secure: req.nextUrl.protocol === "https:",
      httpOnly: false, // read client-side for Calendly UTM params
    });
  }
  return res;
}

export const config = {
  // Page routes only: skip API, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|llms-full.txt|.*\\..*).*)"],
};
