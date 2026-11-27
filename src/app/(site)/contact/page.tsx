import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Inquiry } from "@/components/inquiry/Inquiry";
import { Img } from "@/components/site/Img";
import { getInquirySettings, getSiteSettings } from "@/content";

export const generateMetadata = () => pageMetadata("contact");

// The inquiry page: the form is open and first in the reading order on every
// screen size; contact details and the path after an inquiry sit beside it.
export default async function ContactPage() {
  const [{ page, sec }, site, inquiry] = await Promise.all([loadPage("contact"), getSiteSettings(), getInquirySettings()]);
  const [process, visit, privacy] = ["process", "visit", "privacy"].map(sec);
  const tel = site.phone ? `tel:+1${site.phone.replace(/\D/g, "")}` : undefined;
  return (
    <article className="ct">
      <header className="ct-open">
        <h1 className="pg-h1">{page.headline}</h1>
        <p className="pg-lead">{page.intro}</p>
      </header>

      <div className="ct-grid">
        <section id="inquire" className="ct-form" aria-label="Inquiry form" tabIndex={-1}>
          <Inquiry
            defaultOpen
            phone={site.phone}
            openOnHash="inquire"
            settings={{ heading: inquiry.heading ?? "", intro: inquiry.intro ?? "", successMessage: inquiry.successMessage ?? "", errorMessage: inquiry.errorMessage ?? "", interestOptions: inquiry.interestOptions ?? [] }}
          />
        </section>

        <aside className="ct-side" aria-label="Contact details">
          <dl className="ct-details">
            {site.phone && <div><dt>Phone</dt><dd><a href={tel} className="ct-big">{site.phone}</a></dd></div>}
            {site.email && <div><dt>Email</dt><dd><a href={`mailto:${site.email}`} className="ct-big">{site.email}</a></dd></div>}
            {site.hours && <div><dt>Visits</dt><dd>{site.hours}</dd></div>}
          </dl>
          <div className="ct-photo"><Img image={visit.image} sizes="(min-width: 1024px) 30vw, 100vw" /></div>
          <h2 className="pg-h3 mt-8">{visit.heading}</h2>
          <Paras s={visit} />
        </aside>
      </div>

      <section className="ct-process surface-dark" aria-labelledby="ct-process">
        <div className="ct-process-photo"><Img image={page.image} sizes="(min-width: 1024px) 40vw, 100vw" /></div>
        <div>
          <h2 id="ct-process" className="pg-h2">{process.heading}</h2>
          <Paras s={process} className="pg-lead text-lavender" />
          <ol className="ct-steps">{process.points?.map((p) => <li key={p}>{p}</li>)}</ol>
        </div>
      </section>

      <section className="ct-privacy" aria-labelledby="ct-privacy">
        <h2 id="ct-privacy" className="pg-h3">{privacy.heading}</h2>
        <Paras s={privacy} />
        <CtaLink link={privacy.cta} />
      </section>
      <Related links={page.related} />
    </article>
  );
}
