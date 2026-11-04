import { renderOg, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Common questions about licensing company records for AI training.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "FAQ", title: alt });
}
