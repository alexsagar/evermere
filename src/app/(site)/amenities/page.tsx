import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { StickySwap } from "@/components/page/StickySwap";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";

export const generateMetadata = () => pageMetadata("amenities");

// An architectural schedule: the walk in, then three chapters (house, outdoors,
// services) with a sticky photograph and each amenity set as a name-and-line entry.
export default async function AmenitiesPage() {
  const { page, sec } = await loadPage("amenities");
  const chapters = ["house", "outdoor", "services"].map(sec);
  return (
    <PageMotion>
      <article className="am">
        <header className="am-open">
          <div className="am-walk" data-m="expand"><Img image={page.image} sizes="100vw" priority /></div>
          <div className="am-open-text">
            <h1 className="pg-h1" data-m="split">{page.headline}</h1>
            <p className="pg-lead">{page.intro}</p>
          </div>
        </header>

        <div className="am-chapters">
          <StickySwap
            side="right"
            aspect="4 / 5"
            items={chapters.map((s) => ({
              key: s.key ?? "",
              title: s.heading ?? "",
              image: s.image,
              children: (
                <>
                  <h2 className="pg-h2">{s.heading}</h2>
                  <Paras s={s} className="pg-lead" />
                  {s.points?.length ? (
                    <dl className="am-schedule">
                      {s.points.map((p) => {
                        const [name, ...rest] = p.split(/:\s|,\s(?=[a-z])/);
                        return rest.length ? (
                          <div key={p}><dt>{name}</dt><dd>{rest.join(", ").replace(/^./, (c) => c.toUpperCase())}</dd></div>
                        ) : (
                          <div key={p}><dt className="sr-only">Amenity</dt><dd>{p}</dd></div>
                        );
                      })}
                    </dl>
                  ) : null}
                  <CtaLink link={s.cta} />
                </>
              ),
            }))}
          />
        </div>

        <section className="am-close surface-dark" aria-label="Arrange a visit">
          <p className="am-close-line">{page.intro?.split(/(?<=\.) /).slice(-1)[0]}</p>
          <CtaLink link={page.cta} className="btn btn-inverse" inquiry />
        </section>
        <Related links={page.related} cta={page.cta} variant="next" />
      </article>
    </PageMotion>
  );
}
