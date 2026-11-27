import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";

export const generateMetadata = () => pageMetadata("about");

// Text-led: the question set very large on Midnight, then the beliefs and
// principles as a numbered manifesto, with photographs as quiet punctuation.
export default async function AboutPage() {
  const { page, sec } = await loadPage("about");
  const [belief, name, principles, place, people] = ["belief", "name", "principles", "place", "people"].map(sec);
  return (
    <PageMotion>
      <article className="ab">
        <header className="ab-open surface-dark">
          <p className="pg-kicker">{page.title}</p>
          <h1 className="ab-title" data-m="split">{page.headline}</h1>
          <p className="pg-lead ab-intro">{page.intro}</p>
        </header>

        <section className="ab-belief" aria-labelledby="ab-belief">
          <div className="ab-belief-photo" data-m="rise"><Img image={belief.image} sizes="(min-width: 1024px) 34vw, 100vw" /></div>
          <div>
            <h2 id="ab-belief" className="pg-h2">{belief.heading}</h2>
            <Paras s={belief} className="pg-lead" />
          </div>
        </section>

        {/* The name: a single paragraph under the couple by the water, set as a quiet aside. */}
        <section className="ab-name" aria-labelledby="ab-name">
          <div className="ab-name-photo"><Img image={page.image} sizes="(min-width: 1024px) 50vw, 100vw" /></div>
          <div className="ab-name-text">
            <h2 id="ab-name" className="pg-h3">{name.heading}</h2>
            <Paras s={name} className="pg-lead" />
          </div>
        </section>

        {/* Principles: a manifesto, each one a large line. */}
        <section className="ab-principles" aria-labelledby="ab-principles">
          <div className="ab-principles-head">
            <h2 id="ab-principles" className="pg-h2">{principles.heading}</h2>
            <Paras s={principles} />
          </div>
          <ol className="ab-manifesto">
            {principles.points?.map((p) => <li key={p}>{p}</li>)}
          </ol>
        </section>

        <section className="ab-pair" aria-label="The place and the people">
          {[place, people].map((s, i) => (
            <div key={s.key} className={`ab-pair-${i}`}>
              <div className="relative aspect-[4/3] overflow-hidden" data-m="depth" data-d={i ? 10 : 4}><Img image={s.image} sizes="(min-width: 1024px) 44vw, 100vw" /></div>
              <h2 className="pg-h3 mt-8">{s.heading}</h2>
              <Paras s={s} />
              <CtaLink link={s.cta} />
            </div>
          ))}
        </section>

        <section className="ab-close" aria-label="Visit">
          <CtaLink link={page.cta} className="btn btn-primary" inquiry />
        </section>
        <Related links={page.related} cta={page.cta} variant="invite" />
      </article>
    </PageMotion>
  );
}
