"use client";

import { useEffect, useRef, useState } from "react";
import { mark } from "@/brand/logo";
import { Img, type ContentImage } from "@/components/site/Img";
import { ease, gsap, SplitText, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";

const SEEN = "evermere:opening-seen";

// Runs during HTML parsing, before first paint. If the opening will play (motion
// allowed, not seen this session), it adds a style rule that shows the closed-door
// cover, so the photograph never flashes first. It touches no React-managed
// attributes. The rule fades the cover after 4s if scripts never take over.
const prePaint = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${SEEN}')){var s=document.createElement('style');s.id='hero-cover-rule';s.textContent='.hero-cover{display:block!important;animation:hero-failsafe .6s 4s forwards}.site-header{animation:hero-header-failsafe .6s 4s both}';document.head.appendChild(s)}}catch(e){}`;

export type HeroProps = {
  headline: string;
  intro: string;
  image: ContentImage;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

/**
 * The Threshold opening. The logo's doorway shows the lake, then widens until
 * the photograph fills the frame; the headline sets line by line. Plays once per
 * session, any scroll, key or touch finishes it at four times the speed, and the
 * complete hero is in the HTML for reduced motion and no-JS visitors.
 */
export function Hero({ headline, intro, image, primary, secondary }: HeroProps) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);
  const [skip, setSkip] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = true;
    try { seen = Boolean(sessionStorage.getItem(SEEN)); } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads sessionStorage once after hydration
    setSkip(seen);
  }, []);

  const play = ready && !reduced && skip === false;

  useGSAP(
    () => {
      if (!ready || skip === null) return;
      document.getElementById("hero-cover-rule")?.remove();
      const el = root.current!;

      // Hand-off as the hero scrolls away: the photograph drifts, the copy lifts.
      if (!reduced) {
        const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
        gsap.to(el.querySelector(".hero-photo img"), { yPercent: 8, scale: 1.06, ease: "none", scrollTrigger: st });
      }
      if (!play) return;

      const photo = el.querySelector<HTMLElement>(".hero-photo")!;
      const w = photo.clientWidth, h = photo.clientHeight;
      // The server-rendered ring sits at scale 3.4, its doorway's foot 39.6px below center.
      const s = { scale: 3.4, cy: h / 2 + 39.6 };
      const end = Math.max(w / 10, h / 17) * 1.08;
      const door = el.querySelector<SVGGElement>(".door")!;
      const ring = el.querySelector<SVGGElement>(".door-ring")!;
      // Doorway and ring share one transform: the logo itself becomes the opening.
      const place = () => {
        door.setAttribute("transform", `translate(${w / 2} ${s.cy}) scale(${s.scale}) translate(-24 -44)`);
        ring.setAttribute("transform", `translate(0 ${s.cy - h / 2}) scale(${s.scale}) translate(-24 -44)`); // ring lives in a centered <svg>
      };
      place();

      // Line masks are removed once the headline has set, so descenders are never clipped at rest.
      const split = SplitText.create(el.querySelector("h1")!, { type: "lines", mask: "lines" });
      const header = document.querySelector(".site-header");
      const tl = gsap.timeline({
        defaults: { ease: ease.open },
        onComplete: () => {
          split.revert();
          try { sessionStorage.setItem(SEEN, "1"); } catch {}
          setSkip(true);
        },
      });
      tl.to(el.querySelector(".door-panel"), { opacity: 0, duration: 0.45, ease: "power1.out" }, 0.3)
        .from(el.querySelector(".hero-photo img"), { scale: 1.2, duration: 2.1 }, 0.3)
        .to(s, { scale: end, cy: h + 2, duration: 1.8, onUpdate: place }, 0.65)
        .to(ring, { opacity: 0, duration: 0.4, ease: "power1.in" }, 0.95)
        .from(el.querySelector(".hero-panel"), { clipPath: "inset(100% 0% 0% 0%)", duration: 0.8, ease: ease.settle }, 2.0)
        .from(split.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: ease.line }, 2.1)
        .from(el.querySelectorAll(".hero-fade"), { opacity: 0, y: 14, duration: 0.7, stagger: 0.08, ease: ease.settle }, 2.35);
      if (header) tl.from(header, { autoAlpha: 0, y: -16, duration: 0.8, ease: ease.settle }, 2.0);

      // Never make anyone wait.
      const hurry = () => tl.timeScale(4);
      const o = { once: true, passive: true } as const;
      addEventListener("wheel", hurry, o);
      addEventListener("touchstart", hurry, o);
      addEventListener("keydown", hurry, o);
      return () => {
        removeEventListener("wheel", hurry);
        removeEventListener("touchstart", hurry);
        removeEventListener("keydown", hurry);
      };
    },
    { scope: root, dependencies: [ready, reduced, skip], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="hero surface-dark" aria-labelledby="hero-title" data-hero="">
      <script dangerouslySetInnerHTML={{ __html: prePaint }} />
      <div className="hero-photo">
        <Img image={image} sizes="100vw" priority />
        {(!ready || skip === null || play) && (
          <svg className={`hero-cover ${play ? "is-live" : ""}`} aria-hidden="true">
            <defs>
              <mask id="hero-doorway" maskUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="#fff" />
                <g className="door"><path d="M19 44V27a5 5 0 0 1 10 0v17Z" fill="#000" /></g>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="#18243D" mask="url(#hero-doorway)" />
            <svg x="50%" y="50%" overflow="visible">
              <g className="door-ring" transform="translate(-81.6 -110) scale(3.4)">
                <path d={mark.body} fill="#fff" fillRule="evenodd" />
                <path className="door-panel" d={mark.accent} fill="#DCDFF5" />
              </g>
            </svg>
          </svg>
        )}
      </div>
      <div className="hero-panel">
        <h1 id="hero-title" className="hero-title">{headline}</h1>
        <p className="hero-fade hero-intro">{intro}</p>
        <div className="hero-fade hero-actions">
          <a href={primary.href} className="btn btn-inverse hero-btn">{primary.label}</a>
          <a href={secondary.href} className="hero-link">{secondary.label}</a>
        </div>
      </div>
    </section>
  );
}
