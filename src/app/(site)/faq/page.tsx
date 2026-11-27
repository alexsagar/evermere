import { CtaLink, Related } from "@/components/page/Blocks";
import { RichText } from "@/components/page/RichText";
import { loadPage, pageMetadata } from "@/components/page/page";
import { getFaqs } from "@/content";

export const generateMetadata = () => pageMetadata("faq");

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Grouped by topic with an index of topics; native <details> for each answer
// (keyboard, screen-reader and no-JS friendly, no animation needed).
export default async function FaqPage() {
  const [{ page }, faqs] = await Promise.all([loadPage("faq"), getFaqs()]);
  const topics = [...new Set(faqs.map((f) => f.topic ?? "General"))];
  return (
    <article className="fq">
      <header className="fq-open">
        <h1 className="pg-h1">{page.headline}</h1>
        <p className="pg-lead">{page.intro}</p>
        <CtaLink link={page.cta} className="btn btn-primary mt-8" inquiry />
      </header>
      <div className="fq-body">
        <nav aria-label="Topics" className="fq-topics">
          <ul>{topics.map((t) => <li key={t}><a href={`#topic-${slug(t)}`}>{t}</a></li>)}</ul>
        </nav>
        <div>
          {topics.map((t) => (
            <section key={t} id={`topic-${slug(t)}`} aria-labelledby={`h-${slug(t)}`} className="fq-group">
              <h2 id={`h-${slug(t)}`} className="pg-h3">{t}</h2>
              {faqs.filter((f) => (f.topic ?? "General") === t).map((f) => (
                <details key={f._id} className="fq-item">
                  <summary>{f.question}</summary>
                  <RichText value={f.answer} className="fq-answer" />
                </details>
              ))}
            </section>
          ))}
        </div>
      </div>
      <Related links={page.related} />
    </article>
  );
}
