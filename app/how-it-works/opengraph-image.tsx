import { renderOg, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "A licensed, de-identified copy. Your originals never move.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "How it works", title: alt });
}
