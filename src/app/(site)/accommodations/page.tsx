import { CtaLink, Paras, Points, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { RichText } from "@/components/page/RichText";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getAccommodations, getGallery } from "@/content";

export const generateMetadata = () => pageMetadata("accommodations");

// Three suite chapters, each composed differently, then what every suite shares.
export default async function AccommodationsPage() {
  const [{ page, sec }, suites, gallery] = await Promise.all([loadPage("accommodations"), getAccommodations(), getGallery()]);
  const [intro, included, personal, couples, guests] = ["suites", "included", "personal", "couples", "guests"].map(sec);
  // Detail photograph: the first suite photograph not already shown on this page.
  const used = new Set([page.image, included.image, personal.image, ...suites.map((x) => x.image)].map((i) => i?.src));
  const detail = (gallery.find((g) => g.category === "accommodations")?.images ?? []).find((i) => i?.src && !used.has(i.src));
  const ask = { label: intro.cta?.label ?? page.cta?.label, href: "/contact" };
  return (
    <PageMotion>
      <article className="ac">
        {/* Opening: the statement, then the suite seen through its own doorway. */}
        <header className="ac-open">
          <div className="ac-open-text">
            <p className="pg-kicker">{page.title}</p>
            <h1 className="pg-h1" data-m="split">{page.headline}</h1>
            <p className="pg-lead">{page.intro}</p>
            <div className="mt-10 max-w-[52ch]"><h2 className="pg-h3">{intro.heading}</h2><Paras s={intro} /></div>
          </div>
          <div className="ac-door"><Img image={page.image} sizes="(min-width: 1024px) 45vw, 100vw" priority /></div>
        </header>

        <ol className="ac-suites" aria-label="Suites">
          {suites.map((s, i) => (
            <li key={s._id} className={`ac-suite ac-suite-${i % 3}`} aria-labelledby={`suite-${i}`}>
              <div className="ac-suite-photo" data-m={i === 1 ? "rise" : "expand"}><Img image={s.image} sizes={i === 1 ? "(min-width: 1024px) 50vw, 100vw" : "100vw"} /></div>
              <div className="ac-suite-text">
                <p className="ac-index">{i + 1} of {suites.length}</p>
                <h2 id={`suite-${i}`} className="pg-h2">{s.title}</h2>
                <p className="pg-lead">{s.summary}</p>
                <RichText value={s.body} />
                {s.features?.length ? <ul className="ac-features">{s.features.map((f) => <li key={f}>{f}</li>)}</ul> : null}
                <p className="ac-caption">{s.image?.alt}</p>
                <CtaLink link={ask} className="btn btn-primary mt-8" inquiry />
              </div>
            </li>
          ))}
        </ol>

        {/* In every suite: the checklist beside two detail photographs. */}
        <section className="ac-included" aria-labelledby="ac-included">
          <div className="ac-included-photos">
            <div className="relative aspect-[3/4]" data-m="depth" data-d="6"><Img image={included.image} sizes="(min-width: 1024px) 24vw, 50vw" /></div>
            <div className="relative aspect-[3/4] mt-16" data-m="depth" data-d="14"><Img image={detail} sizes="(min-width: 1024px) 24vw, 50vw" /></div>
          </div>
          <div>
            <h2 id="ac-included" className="pg-h2">{included.heading}</h2>
            <Paras s={included} className="pg-lead" />
            <Points s={included} className="ac-checklist" />
          </div>
        </section>

        {/* Make it yours, couples and guests: three short notes on Lavender. */}
        <section className="ac-notes" aria-label="Living here">
          <div className="ac-note-photo"><Img image={personal.image} sizes="(min-width: 1024px) 36vw, 100vw" /></div>
          {[personal, couples, guests].map((s) => (
            <div key={s.key} className="ac-note">
              <h2 className="pg-h3">{s.heading}</h2>
              <Paras s={s} />
              <CtaLink link={s.cta} />
            </div>
          ))}
        </section>
        <Related links={page.related} cta={page.cta} variant="next" />
      </article>
    </PageMotion>
  );
}
