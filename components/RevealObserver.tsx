"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The site's only animation JS. Adds .js-reveal to <html> after mount, then
 * reveals [data-reveal] elements as they enter the viewport. Content is
 * visible without JS and under prefers-reduced-motion.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    // Anything already on screen is marked visible before the class is added, so nothing flashes.
    const vh = window.innerHeight;
    for (const el of els) if (el.getBoundingClientRect().top < vh) el.classList.add("is-visible");
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    els.forEach((el) => !el.classList.contains("is-visible") && io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
