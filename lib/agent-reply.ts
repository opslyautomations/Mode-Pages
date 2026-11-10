import { FORBIDDEN_DOMAINS } from "@/config/banned-phrases";
import { SITE_NAME } from "@/config/site";

const DOMAIN_RE = new RegExp(FORBIDDEN_DOMAINS.map((d) => d.replace(/\./g, "\\.")).join("|"), "gi");

/**
 * The GoHighLevel agent signals a qualified visitor by putting this exact
 * marker in its reply. Add the instruction to the agent's prompt in GHL
 * (see .env.example for the exact wording). The marker is stripped before display.
 */
export const BOOK_MARKER = "[[BOOK]]";

export type AgentReply = { text: string; qualified: boolean };

/**
 * Cleans the agent's reply for the chat window:
 * - detects and removes the booking marker
 * - never shows the buyer's name (the agent's own prompt may still use it)
 * - turns light markdown into plain text (bold markers removed, "- " bullets → "• ")
 */
export function cleanAgentReply(raw: string): AgentReply {
  const qualified = raw.includes(BOOK_MARKER);
  const text = raw
    .split(BOOK_MARKER)
    .join("")
    .replace(/\bMode Referral Program\b/g, SITE_NAME)
    .replace(/\bMode(?:'s)? (?:program|team)\b/g, "our data partner's program")
    .replace(DOMAIN_RE, "")
    .replace(/\bMode\b/g, "our data partner")
    .replace(/\*\*(.+?)\*\*/g, (_, t: string) => t)
    .replace(/__(.+?)__/g, (_, t: string) => t)
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    // Capitalise the replacement where it starts a sentence, line, or bullet.
    .replace(/(^|[.!?]\s+|\n\s*|• )our data partner/g, (_, lead: string) => `${lead}Our data partner`);
  return { text, qualified };
}
