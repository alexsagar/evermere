"use client";

import { useEffect } from "react";

// The header is transparent while an element marked [data-hero] is under it,
// and opaque otherwise. One IntersectionObserver; no scroll listener.
export function HeaderState() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.querySelector("[data-hero]");
    if (!header || !hero) return;
    const io = new IntersectionObserver(([e]) => header.toggleAttribute("data-solid", !e.isIntersecting), { rootMargin: "-88px 0px 0px 0px" });
    io.observe(hero);
    return () => {
      io.disconnect();
      header.setAttribute("data-solid", "");
    };
  }, []);
  return null;
}
