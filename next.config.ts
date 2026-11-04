import type { NextConfig } from "next";

const vanity: [string[], string, string][] = [
  [["/law", "/lawyers", "/legal"], "/law-firms", "law-firms"],
  [["/cpa", "/accounting", "/accountants"], "/accounting-firms", "accounting-firms"],
  [["/agency", "/agencies", "/marketing"], "/marketing-agencies", "marketing-agencies"],
  [["/home", "/homeservices", "/trades"], "/home-services", "home-services"],
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    // Podcast vanity routes hosts say out loud. Existing query (?ep=12) is preserved and merged.
    return [
      ...vanity.flatMap(([sources, destination, niche]) =>
        sources.map((source) => ({
          source,
          destination: `${destination}?src=podcast&niche=${niche}`,
          permanent: false,
        }))
      ),
      { source: "/fit", destination: "/qualify?src=podcast", permanent: false },
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
      { source: "/(result|book)/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/book", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
