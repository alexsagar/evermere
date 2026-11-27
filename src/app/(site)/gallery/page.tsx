import { CtaLink, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { GalleryView } from "@/components/page/GalleryView";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getGallery } from "@/content";

export const generateMetadata = () => pageMetadata("gallery");

// Opening: one photograph, letterboxed, with the headline across its lower edge.
// Then the full collection, filterable, with a viewer.
export default async function GalleryPage() {
  const [{ page }, gallery] = await Promise.all([loadPage("gallery"), getGallery()]);
  const groups = gallery.map((g) => ({ slug: g.slug ?? "", title: g.title ?? "", images: (g.images ?? []).filter((i): i is NonNullable<typeof i> => Boolean(i?.src)) }));
  // The last exterior photograph closes the page; the invitation is the intro's final sentence.
  const closing = groups.find((g) => g.slug === "exterior")?.images.at(-1) ?? page.image;
  const invite = page.intro?.split(/(?<=\.)\s+/).at(-1);
  return (
    <PageMotion>
    <article className="gp2">
      <header className="gp2-open surface-dark">
        <div className="gp2-photo"><Img image={page.image} sizes="100vw" priority /></div>
        <div className="gp2-open-text">
          <h1 className="pg-h1">{page.headline}</h1>
          <p className="pg-lead text-lavender">{page.intro}</p>
        </div>
      </header>
      <section className="gp2-body" aria-label="All photographs">
        <GalleryView groups={groups} />
      </section>
      {/* Closing: a last full-bleed view, and the invitation to see it in person. */}
      <section className="gp2-close surface-dark" aria-labelledby="gp2-close">
        <div className="gp2-close-photo" data-m="expand"><Img image={closing} sizes="100vw" /></div>
        <div className="gp2-close-text">
          <h2 id="gp2-close" className="pg-h2">{invite}</h2>
          <CtaLink link={page.cta} className="btn gp2-close-btn" inquiry />
        </div>
      </section>
      <Related links={page.related} />
    </article>
    </PageMotion>
  );
}
