import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getGallery } from "@/content";

export const generateMetadata = () => pageMetadata("dining");

// A culinary editorial: the room first, then plates set into white space,
// with the day told as a column of times-of-day rather than a menu.
export default async function DiningPage() {
  const [{ page, sec }, gallery] = await Promise.all([loadPage("dining"), getGallery()]);
  const [kitchen, day, choice, together, seasons] = ["kitchen", "day", "choice", "together", "seasons"].map(sec);
  const used = new Set([page.image, kitchen.image, day.image, choice.image, together.image, seasons.image].map((i) => i?.src));
  const extra = (gallery.find((g) => g.category === "dining")?.images ?? []).filter((i) => i?.src && !used.has(i.src));
  return (
    <PageMotion>
      <article className="dn2">
        {/* Opening: the room under a band of type, like a menu cover. */}
        <header className="dn2-open">
          <h1 className="dn2-title" data-m="split">{page.headline}</h1>
          <div className="dn2-room"><Img image={page.image} sizes="100vw" priority /></div>
          <p className="pg-lead dn2-intro">{page.intro}</p>
        </header>

        {/* Kitchen: an overhead plate floating over the second room view. */}
        <section className="dn2-kitchen" aria-labelledby="dn2-kitchen">
          <div className="dn2-back" data-m="depth" data-d="6"><Img image={extra[0] ?? choice.image} sizes="(min-width: 1024px) 60vw, 100vw" /></div>
          <div className="dn2-plate" data-m="depth" data-d="10"><Img image={kitchen.image} sizes="(min-width: 1024px) 28vw, 60vw" /></div>
          <div className="dn2-kitchen-text">
            <h2 id="dn2-kitchen" className="pg-h2">{kitchen.heading}</h2>
            <Paras s={kitchen} className="pg-lead" />
          </div>
        </section>

        {/* Through the day: a timeline column with three plates as markers. */}
        <section className="dn2-day" aria-labelledby="dn2-day">
          <h2 id="dn2-day" className="pg-h2">{day.heading}</h2>
          <div className="dn2-day-grid">
            <div className="dn2-day-text"><Paras s={day} className="pg-lead" /></div>
            {[day.image, seasons.image, extra[1]].filter(Boolean).map((img, i) => (
              <div key={img!.src} className={`dn2-mark dn2-mark-${i}`} data-m="rise"><Img image={img} sizes="(min-width: 1024px) 22vw, 45vw" /></div>
            ))}
          </div>
        </section>

        {/* Choice and seasons: text-led, on Cloud. */}
        <section className="dn2-notes" aria-label="Choice and seasons">
          {[choice, seasons].map((s) => (
            <div key={s.key}>
              <h2 className="pg-h3">{s.heading}</h2>
              <Paras s={s} />
            </div>
          ))}
        </section>

        {/* Together: the long table, full bleed, with the invitation. */}
        <section className="dn2-together surface-dark" aria-labelledby="dn2-together">
          <div className="dn2-together-photo"><Img image={together.image} sizes="(min-width: 1024px) 55vw, 100vw" /></div>
          <div className="dn2-together-text">
            <h2 id="dn2-together" className="pg-h2">{together.heading}</h2>
            <Paras s={together} className="pg-lead text-lavender" />
            <CtaLink link={page.cta} className="btn btn-inverse mt-8" inquiry />
          </div>
        </section>
        <Related links={page.related} cta={page.cta} variant="next" />
      </article>
    </PageMotion>
  );
}
