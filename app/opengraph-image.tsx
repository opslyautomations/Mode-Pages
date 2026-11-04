import { renderOg, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Your firm's operating history may be worth more than you think.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ eyebrow: "Company data licensing", title: alt });
}
