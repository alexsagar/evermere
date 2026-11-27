import { CtaLink, Paras, Points, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";

export const generateMetadata = () => pageMetadata("our-home");

// An architectural publication: cover, elevation, plan of rooms, the outside, details.
export default async function OurHomePage() {
  const { page, sec } = await loadPage("our-home");
  const [arch, commons, rooms, court, shore, design] = ["architecture", "commons", "rooms", "courtyard", "shore", "design"].map(sec);
  return (
    <PageMotion>
      <article className="oh">
        {/* Cover: oversized title beside a tall elevation of the house. */}
        <header className="oh-cover">
          <div className="oh-cover-text">
            <p className="pg-kicker">{page.title}</p>
            <h1 className="oh-title" data-m="split">{page.headline}</h1>
            <p className="pg-lead">{page.intro}</p>
          </div>
          <div className="oh-cover-photo"><Img image={page.image} sizes="(min-width: 1024px) 42vw, 100vw" priority /></div>
        </header>

        {/* Elevation: a full-width view that widens as you read. */}
        <section className="oh-arch" aria-labelledby="oh-arch">
          <div className="oh-wide" data-m="expand"><Img image={arch.image} sizes="100vw" /></div>
          <div className="oh-cols">
            <h2 id="oh-arch" className="pg-h2">{arch.heading}</h2>
            <div className="pg-body"><Paras s={arch} /></div>
          </div>
        </section>

        {/* The Commons: interior photograph with the text set into its lower edge. */}
        <section className="oh-commons" aria-labelledby="oh-commons">
          <div className="oh-commons-photo"><Img image={commons.image} sizes="(min-width: 1024px) 70vw, 100vw" /></div>
          <div className="oh-commons-text surface-dark">
            <h2 id="oh-commons" className="pg-h2">{commons.heading}</h2>
            <Paras s={commons} />
          </div>
        </section>

        {/* Rooms: a typographic room schedule beside the Library. */}
        <section className="oh-rooms" aria-labelledby="oh-rooms">
          <div>
            <h2 id="oh-rooms" className="pg-h2">{rooms.heading}</h2>
            <Paras s={rooms} className="pg-lead" />
            <Points s={rooms} className="oh-schedule" />
          </div>
          <figure className="oh-rooms-photo">
            <div className="relative aspect-[4/5]" data-m="rise"><Img image={rooms.image} sizes="(min-width: 1024px) 34vw, 100vw" /></div>
            <figcaption>{rooms.image?.alt}</figcaption>
          </figure>
        </section>

        {/* Outside: the covered walk and the shore as one long horizontal spread. */}
        <section className="oh-outside surface-dark" aria-label="Outside">
          <div className="oh-outside-grid">
            <div className="oh-court">
              <div className="relative aspect-[3/2]"><Img image={court.image} sizes="(min-width: 1024px) 50vw, 100vw" /></div>
              <h2 className="pg-h3 mt-8">{court.heading}</h2>
              <Paras s={court} />
              <CtaLink link={court.cta} className="text-link text-link-light" />
            </div>
            <div className="oh-shore">
              <div className="relative aspect-[4/5]" data-m="depth" data-d="8"><Img image={shore.image} sizes="(min-width: 1024px) 36vw, 100vw" /></div>
              <h2 className="pg-h3 mt-8">{shore.heading}</h2>
              <Paras s={shore} />
            </div>
          </div>
        </section>

        {/* Detail: a cedar texture with the design note set across it. */}
        <section className="oh-detail" aria-labelledby="oh-design">
          <div className="oh-detail-photo" data-m="depth" data-d="10"><Img image={design.image} sizes="(min-width: 1024px) 40vw, 100vw" /></div>
          <div className="oh-detail-text">
            <h2 id="oh-design" className="pg-h2">{design.heading}</h2>
            <Paras s={design} className="pg-lead" />
            <CtaLink link={page.cta} className="btn btn-primary mt-10" inquiry />
          </div>
        </section>
        <Related links={page.related} cta={page.cta} variant="next" />
      </article>
    </PageMotion>
  );
}
