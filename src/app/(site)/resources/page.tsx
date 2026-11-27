import Link from "next/link";
import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getArticles } from "@/content";

export const generateMetadata = () => pageMetadata("resources");

// A reading list, not a card grid: the first guide is a feature spread, the
// rest are numbered entries with a small photograph each.
export default async function ResourcesPage() {
  const [{ page, sec }, articles] = await Promise.all([loadPage("resources"), getArticles()]);
  const [guides, conversation] = ["guides", "conversation"].map(sec);
  const [first, ...rest] = articles;
  return (
    <article className="rs">
      <header className="rs-open">
        <h1 className="pg-h1">{page.headline}</h1>
        <p className="pg-lead">{page.intro}</p>
      </header>

      <section className="rs-list" aria-labelledby="rs-guides">
        <div className="rs-head">
          <h2 id="rs-guides" className="pg-h3">{guides.heading}</h2>
          <Paras s={guides} />
        </div>
        {first && (
          <Link href={`/resources/${first.slug}`} className="rs-feature">
            <div className="rs-feature-photo"><Img image={first.image} sizes="(min-width: 1024px) 55vw, 100vw" priority /></div>
            <div>
              <h3 className="pg-h2">{first.title}</h3>
              <p className="pg-lead mt-4">{first.summary}</p>
              <span className="text-link">Read the guide</span>
            </div>
          </Link>
        )}
        <ol className="rs-entries">
          {rest.map((a, i) => (
            <li key={a._id}>
              <Link href={`/resources/${a.slug}`} className="rs-entry">
                <span className="rs-num">{i + 2}</span>
                <span className="rs-entry-text"><h3 className="pg-h3">{a.title}</h3><span className="mt-2 block">{a.summary}</span></span>
                <span className="rs-thumb"><Img image={a.image} sizes="160px" decorative /></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="rs-talk surface-dark" aria-labelledby="rs-talk">
        <h2 id="rs-talk" className="pg-h2">{conversation.heading}</h2>
        <Paras s={conversation} className="pg-lead text-lavender" />
        <CtaLink link={conversation.cta} className="btn btn-inverse mt-8" inquiry />
      </section>
      <Related links={page.related} />
    </article>
  );
}
