import { Paras, Points, Related } from "./Blocks";
import type { PageData, Section } from "./page";

/** Privacy and accessibility: a plain document with a contents list and no motion. */
export function DocumentPage({ page, sections }: { page: PageData; sections: Section[] }) {
  return (
    <article className="doc">
      <header className="doc-head">
        <h1 className="pg-h1">{page.headline}</h1>
        <p className="pg-lead">{page.intro}</p>
      </header>
      <div className="doc-body">
        <nav aria-label="Contents" className="doc-toc">
          <ol>{sections.map((s) => <li key={s.key}><a href={`#doc-${s.key}`}>{s.heading}</a></li>)}</ol>
        </nav>
        <div className="doc-main">
          {sections.map((s) => (
            <section key={s.key} id={`doc-${s.key}`} aria-labelledby={`doc-h-${s.key}`}>
              <h2 id={`doc-h-${s.key}`} className="pg-h3">{s.heading}</h2>
              <Paras s={s} />
              <Points s={s} />
            </section>
          ))}
        </div>
      </div>
      <Related links={page.related} />
    </article>
  );
}
