import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { RichText } from "@/components/page/RichText";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getCareServices } from "@/content";

export const generateMetadata = () => pageMetadata("care-services");

// Calm and structured on purpose: no scroll motion. A clear contents list, the
// approach and the plan, then each area of help as a plainly set entry.
export default async function CareServicesPage() {
  const [{ page, sec }, services] = await Promise.all([loadPage("care-services"), getCareServices()]);
  const [approach, plan, help, coordination, honesty] = ["approach", "plan", "services", "coordination", "honesty"].map(sec);
  const contents = [approach, plan, help, coordination, honesty];
  return (
    <article className="cs">
      <header className="cs-open">
        <div className="cs-open-text">
          <p className="pg-kicker">{page.title}</p>
          <h1 className="pg-h1">{page.headline}</h1>
          <p className="pg-lead">{page.intro}</p>
          <CtaLink link={page.cta} className="btn btn-primary mt-8" inquiry />
        </div>
        <div className="cs-open-photo"><Img image={page.image} sizes="(min-width: 1024px) 36vw, 100vw" priority /></div>
      </header>

      <div className="cs-body">
        <nav aria-label="On this page" className="cs-toc">
          <ul>{contents.map((s) => <li key={s.key}><a href={`#cs-${s.key}`}>{s.heading}</a></li>)}</ul>
        </nav>
        <div className="cs-main">
          <section id={`cs-${approach.key}`} aria-labelledby="cs-h-approach" className="cs-section">
            <h2 id="cs-h-approach" className="pg-h2">{approach.heading}</h2>
            <Paras s={approach} className="cs-text" />
            <div className="cs-photo"><Img image={approach.image} sizes="(min-width: 1024px) 50vw, 100vw" /></div>
          </section>
          <section id={`cs-${plan.key}`} aria-labelledby="cs-h-plan" className="cs-section cs-plan">
            <h2 id="cs-h-plan" className="pg-h2">{plan.heading}</h2>
            <Paras s={plan} className="cs-text" />
            {plan.image ? <div className="cs-photo cs-photo-tall"><Img image={plan.image} sizes="(min-width: 1024px) 40vw, 100vw" /></div> : null}
          </section>
          <section id={`cs-${help.key}`} aria-labelledby="cs-h-services" className="cs-section">
            <h2 id="cs-h-services" className="pg-h2">{help.heading}</h2>
            <Paras s={help} className="cs-text" />
            <ol className="cs-services">
              {services.map((s, i) => (
                <li key={s._id}>
                  <p className="cs-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="pg-h3">{s.title}</h3>
                  <p className="cs-text">{s.summary}</p>
                  <RichText value={s.body} />
                  {s.highlights?.length ? <ul className="cs-highlights">{s.highlights.map((h) => <li key={h}>{h}</li>)}</ul> : null}
                </li>
              ))}
            </ol>
            <CtaLink link={help.cta} className="btn btn-secondary mt-10" inquiry />
          </section>
          <section id={`cs-${coordination.key}`} aria-labelledby="cs-h-coordination" className="cs-section">
            <h2 id="cs-h-coordination" className="pg-h2">{coordination.heading}</h2>
            <Paras s={coordination} className="cs-text" />
            {coordination.image ? <div className="cs-photo"><Img image={coordination.image} sizes="(min-width: 1024px) 50vw, 100vw" /></div> : null}
          </section>
          <section id={`cs-${honesty.key}`} aria-labelledby="cs-h-honesty" className="cs-section cs-honesty surface-dark">
            <h2 id="cs-h-honesty" className="pg-h2">{honesty.heading}</h2>
            <Paras s={honesty} className="cs-text" />
            <CtaLink link={honesty.cta} className="btn btn-inverse mt-8" inquiry />
          </section>
        </div>
      </div>
      <Related links={page.related} cta={page.cta} variant="next" />
    </article>
  );
}
