/**
 * Thin analytics wrapper. Plausible (NEXT_PUBLIC_PLAUSIBLE_DOMAIN) or GA4
 * (NEXT_PUBLIC_GA_ID); a no-op when neither is set.
 */

export type AnalyticsEvent =
  | "episode_play"
  | "qualifier_start"
  | `qualifier_step_${number}`
  | "qualifier_complete"
  | "booking_view"
  | "booking_complete"
  | "cta_click";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (window.plausible) window.plausible(event, { props });
    else if (window.gtag) window.gtag("event", event, props);
  } catch {
    // analytics must never break the page
  }
}
