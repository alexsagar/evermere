import Link from "next/link";
import { Img } from "@/components/site/Img";
import type { Chapter } from "./types";

/**
 * G. Support, and I. Family: the two calm reading sections. No motion by design:
 * the page slows down where trust matters. Support sits under a Threshold arch
 * frame on Cloud; Family is set on Royal with the photograph breaking the edge.
 */
export function Support({ chapter }: { chapter: Chapter }) {
  return (
    <section className="support" aria-labelledby="sp-title">
      <div className="sp-arch"><Img image={chapter.image} sizes="(min-width: 1024px) 30vw, 80vw" /></div>
      <div className="sp-copy">
        <h2 id="sp-title" className="sp-title">{chapter.heading}</h2>
        {chapter.body?.map((b) => <p key={b}>{b}</p>)}
        {chapter.cta?.href && <Link href={chapter.cta.href} className="text-link">{chapter.cta.label}</Link>}
      </div>
    </section>
  );
}

export function Family({ chapter }: { chapter: Chapter }) {
  return (
    <section className="family surface-dark" aria-labelledby="fm-title">
      <div className="fm-photo"><Img image={chapter.image} sizes="(min-width: 1024px) 44vw, 100vw" /></div>
      <div className="fm-copy">
        <h2 id="fm-title" className="fm-title">{chapter.heading}</h2>
        {chapter.body?.map((b) => <p key={b}>{b}</p>)}
        {chapter.cta?.href && <Link href={chapter.cta.href} className="text-link text-link-light">{chapter.cta.label}</Link>}
      </div>
    </section>
  );
}
