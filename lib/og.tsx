import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/config/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Ledger-styled Open Graph image: paper background, headline, the threshold
 * ruler motif with the niche minimum marked in the accent colour.
 */
export function renderOg({ eyebrow, title, threshold }: { eyebrow: string; title: string; threshold?: number }) {
  const ticks = Array.from({ length: 41 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F7F5F0", color: "#15171A", padding: "64px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#4A4E55" }}>{eyebrow}</div>
          <div style={{ fontSize: 60, lineHeight: 1.08, fontWeight: 700, marginTop: 24, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", display: "flex", height: 60, alignItems: "flex-end", justifyContent: "space-between", borderBottom: "2px solid #4A4E55" }}>
            {ticks.map((i) => (
              <div key={i} style={{ width: i === threshold ? 4 : 2, height: i === threshold ? 56 : i % 5 === 0 ? 24 : 12, background: i === threshold ? "#1F5F4A" : i % 5 === 0 ? "#4A4E55" : "#D9D5CC" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 24, color: "#4A4E55" }}>
            <span>{SITE_NAME}</span>
            {threshold != null ? <span style={{ color: "#1F5F4A", fontWeight: 700 }}>{threshold}+ desk employees · 3+ years of records</span> : <span>90-second fit check</span>}
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
