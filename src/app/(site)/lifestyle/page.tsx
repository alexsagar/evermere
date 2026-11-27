import { Paras, Points, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getGallery } from "@/content";

export const generateMetadata = () => pageMetadata("lifestyle");

// A photographic journal: intimate and expansive moments alternate; a sideways
// strip of everyday photographs sits at the centre. People are never named.
export default async function LifestylePage() {
  const [{ page, sec }, gallery] = await Promise.all([loadPage("lifestyle"), getGallery()]);
  const [rhythm, interests, outings, contribute, quiet] = ["rhythm", "interests", "outings", "contribute", "quiet"].map(sec);
  const used = new Set([page.image, rhythm.image, interests.image, outings.image, contribute.image, quiet.image].map((i) => i?.src));
  const strip = (gallery.find((g) => g.category === "lifestyle")?.images ?? []).filter((i) => i?.src && !used.has(i.src)).slice(0, 7);
  return (
    <PageMotion>
      <article className="ls">
        {/* Opening: oversized line of type, the photograph tucked under its last word. */}
        <header className="ls-open">
          <h1 className="ls-title" data-m="split">{page.headline}</h1>
          <div className="ls-open-grid">
            <p className="pg-lead">{page.intro}</p>
            <div className="ls-open-photo"><Img image={page.image} sizes="(min-width: 1024px) 50vw, 100vw" priority /></div>
          </div>
        </header>

        {/* Morning: a small, close photograph and long-form text. */}
        <section className="ls-rhythm" aria-labelledby="ls-rhythm">
          <div className="ls-small" data-m="rise"><Img image={rhythm.image} sizes="(min-width: 1024px) 26vw, 70vw" /></div>
          <div>
            <h2 id="ls-rhythm" className="pg-h2">{rhythm.heading}</h2>
            <Paras s={rhythm} className="pg-lead" />
          </div>
        </section>

        {/* Interests: the list as a journal page beside a tall portrait. */}
        <section className="ls-interests" aria-labelledby="ls-interests">
          <div>
            <h2 id="ls-interests" className="pg-h2">{interests.heading}</h2>
            <Paras s={interests} />
            <Points s={interests} className="ls-list" />
          </div>
          <div className="ls-tall" data-m="depth" data-d="10"><Img image={interests.image} sizes="(min-width: 1024px) 36vw, 100vw" /></div>
        </section>

        {/* A day in photographs: a strip that drifts sideways as you pass. */}
        <section className="ls-strip surface-dark" aria-label="Everyday moments">
          <ul className="ls-track" data-m="pan">
            {strip.map((img, i) => (
              <li key={img!.src} className={`ls-frame ls-frame-${i % 3}`}><Img image={img} sizes="(min-width: 1024px) 28vw, 70vw" /></li>
            ))}
          </ul>
        </section>

        {/* Outings: expansive, full width. */}
        <section className="ls-out" aria-labelledby="ls-out">
          <div className="ls-wide" data-m="expand"><Img image={outings.image} sizes="100vw" /></div>
          <div className="ls-out-text">
            <h2 id="ls-out" className="pg-h2">{outings.heading}</h2>
            <Paras s={outings} className="pg-lead" />
          </div>
        </section>

        {/* Contribute and quiet: a pair, offset. */}
        <section className="ls-pair" aria-label="Contribute and quiet">
          {[contribute, quiet].map((s, i) => (
            <div key={s.key} className={`ls-pair-item ls-pair-${i}`}>
              <div className="relative aspect-[4/3]" data-m="depth" data-d="6"><Img image={s.image} sizes="(min-width: 1024px) 40vw, 100vw" /></div>
              <h2 className="pg-h3 mt-12">{s.heading}</h2>
              <Paras s={s} />
            </div>
          ))}
        </section>

        <Related links={page.related} cta={page.cta} variant="next" />
      </article>
    </PageMotion>
  );
}
