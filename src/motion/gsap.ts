"use client";

// Single GSAP registration point for every client animation. Import from here,
// never from "gsap" directly. Single-use plugins (Flip, Observer) import beside their only user.
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// Lab-only handle for tests and review captures: trigger counts, deterministic seeking.
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __lab: unknown }).__lab = { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

// Flip and Observer are used by one component each, so they register where used
// (registerPlugin is idempotent) and stay out of every other page's bundle.

/** Names a timeline for review captures and tests (development only). Returns it unchanged. */
export function labTimeline<T extends gsap.core.Timeline>(name: string, tl: T): T {
  if (process.env.NODE_ENV !== "production") ((window as unknown as { __labTimelines?: Record<string, unknown> }).__labTimelines ??= {})[name] = tl;
  return tl;
}

/** Shared easing vocabulary: architectural, unhurried, no bounce. */
export const ease = { open: "power3.inOut", settle: "power2.out", line: "expo.out" } as const;
