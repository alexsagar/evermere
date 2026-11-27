"use client";

import { useRef } from "react";
import { ease, gsap, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";

/**
 * Closing entrance, once, as the footer arrives: the closing line settles, the page
 * index follows, and the logo rises out of the baseline. No pinning, no scrub.
 * Server HTML is final; reduced motion and no-JavaScript visitors see it as is.
 */
export function FooterReveal() {
  const anchor = useRef<HTMLSpanElement>(null);
  const { ready, reduced } = useMotion();

  useGSAP(() => {
    const footer = anchor.current?.closest("footer");
    if (!ready || reduced || !footer) return;
    const tl = gsap.timeline({ paused: true, defaults: { ease: ease.settle } });
    tl.from(footer.querySelectorAll("[data-ft]"), { opacity: 0, y: 28, duration: 0.8, stagger: 0.12 })
      .from(footer.querySelectorAll("[data-ft-link]"), { opacity: 0, y: 12, duration: 0.5, stagger: 0.03 }, "-=0.5")
      .fromTo(footer.querySelector("[data-ft-mark]"), { clipPath: "inset(100% 0% 0% 0%)", yPercent: 18 }, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 1.1, ease: ease.line, immediateRender: true }, "-=0.6");
    // The timeline holds its start state and plays once the footer starts to show.
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      tl.play();
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(footer);
    return () => { io.disconnect(); tl.progress(1).kill(); };
  }, { dependencies: [ready, reduced] });

  return <span ref={anchor} hidden />;
}
