import { renderOg, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Check if your firm qualifies.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "90-second fit check", title: alt });
}
