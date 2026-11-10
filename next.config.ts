import type { NextConfig } from "next";

// Single-page build: every vanity route and every old page lands on the chat,
// with ?niche= so the assistant can skip the industry question.
const vanity: [string[], string][] = [
  [["/law", "/lawyers", "/legal", "/law-firms"], "law-firms"],
  [["/cpa", "/accounting", "/accountants", "/accounting-firms"], "accounting-firms"],
  [["/agency", "/agencies", "/marketing", "/marketing-agencies"], "marketing-agencies"],
  [["/home", "/homeservices", "/trades", "/home-services"], "home-services"],
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    // Podcast vanity routes hosts say out loud. Existing query (?ep=12) is preserved and merged.
    return [
      ...vanity.flatMap(([sources, niche]) =>
        sources.map((source) => ({
          source,
          destination: `/?src=podcast&niche=${niche}#chat`,
          permanent: false,
        }))
      ),
      { source: "/:slug(law-firms|accounting-firms|marketing-agencies|home-services)/episode", destination: "/?niche=:slug#chat", permanent: false },
      { source: "/fit", destination: "/?src=podcast#chat", permanent: false },
      { source: "/:page(qualify|how-it-works|faq|book)", destination: "/#chat", permanent: false },
      { source: "/result/:tier", destination: "/#chat", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
