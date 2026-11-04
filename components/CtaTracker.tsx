"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires cta_click for any element with data-cta="<location>". */
export function CtaTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cta]");
      if (el) track("cta_click", { location: el.dataset.cta, path: window.location.pathname });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
