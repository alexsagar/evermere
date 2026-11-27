import { CtaLink, Paras, Related } from "@/components/page/Blocks";
import { PageMotion } from "@/components/page/PageMotion";
import { loadPage, pageMetadata } from "@/components/page/page";
import { Img } from "@/components/site/Img";
import { getTeam } from "@/content";

export const generateMetadata = () => pageMetadata("our-team");

// Roles, not profiles: no names or portraits are invented. The six roles are set
// as a large typographic directory beside the shared rooms where the work happens.
export default async function OurTeamPage() {
  const [{ page, sec }, team] = await Promise.all([loadPage("our-team"), getTeam()]);
  const [roles, hiring, families] = ["roles", "hiring", "families"].map(sec);
  return (
    <PageMotion>
      <article className="tm">
        <header className="tm-open">
          <div className="tm-open-photo" data-m="expand"><Img image={page.image} sizes="100vw" priority /></div>
          <div className="tm-open-text surface-dark">
            <h1 className="pg-h1" data-m="split">{page.headline}</h1>
            <p className="pg-lead">{page.intro}</p>
          </div>
        </header>

        <section className="tm-roles" aria-labelledby="tm-roles">
          <div className="tm-roles-head">
            <h2 id="tm-roles" className="pg-h2">{roles.heading}</h2>
            <Paras s={roles} className="pg-lead" />
          </div>
          <ol className="tm-directory">
            {team.map((t) => (
              <li key={t._id}>
                <h3 className="tm-role">{t.role}</h3>
                {t.name && <p className="tm-name">{t.name}</p>}
                <p>{t.bio}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="tm-hiring" aria-labelledby="tm-hiring">
          <h2 id="tm-hiring" className="pg-h2">{hiring.heading}</h2>
          <Paras s={hiring} className="pg-lead" />
        </section>

        <section className="tm-families surface-dark" aria-labelledby="tm-families">
          <div className="tm-families-photo"><Img image={families.image} sizes="(min-width: 1024px) 44vw, 100vw" /></div>
          <div className="tm-families-text">
            <h2 id="tm-families" className="pg-h2">{families.heading}</h2>
            <Paras s={families} className="pg-lead text-white" />
            <CtaLink link={families.cta} className="btn btn-inverse mt-8" inquiry />
          </div>
        </section>
        <Related links={page.related} cta={page.cta} variant="invite" />
      </article>
    </PageMotion>
  );
}
