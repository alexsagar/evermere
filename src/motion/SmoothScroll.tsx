"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { useMotion } from "./useMotion";

// One Lenis instance for the whole lab, driven by GSAP's ticker so ScrollTrigger
// and Lenis read the same frame. Off with reduced motion and on touch devices,
// where native scrolling is kept.
export function SmoothScroll() {
  const { ready, reduced } = useMotion();

  useEffect(() => {
    if (!ready || reduced || matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true });
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [ready, reduced]);

  return null;
}
