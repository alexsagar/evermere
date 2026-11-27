import { NavLink } from "./NavLink";
import { ContentLogo } from "@/components/brand/ContentLogo";
import { FooterReveal } from "./FooterReveal";
import type { ContentImage } from "./Img";

type NavItem = { label?: string | null; href?: string | null };
type Site = { name?: string | null; tagline?: string | null; phone?: string | null; email?: string | null; hours?: string | null; logoDark?: ContentImage };
type Link = { label: string; href: string };

// Legal pages sit in the closing line rather than the main navigation.
const LEGAL = new Set(["/privacy", "/accessibility"]);

/**
 * The closing chapter. A large closing line and one way to reach the team, a single
 * flowing index of every page, then the CMS logo at full measure as the last image.
 * Everything comes from Sanity (name, tagline, contact, logo, navigation), so any
 * name or logo proportions fit. Fully readable without JavaScript; FooterReveal only
 * adds a short entrance.
 */
export function SiteFooter({ site, primary, secondary, cta }: { site: Site; primary: NavItem[]; secondary: NavItem[]; cta: Link }) {
  const seen = new Set<string>();
  const links = [...primary, ...secondary].filter((l): l is Link => {
    if (!l.label || !l.href || seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
  const pages = links.filter((l) => !LEGAL.has(l.href));
  const legal = links.filter((l) => LEGAL.has(l.href));
  const phoneHref = site.phone ? `tel:+1${site.phone.replace(/\D/g, "")}` : undefined;

  return (
    <footer className="ft surface-dark">
      <FooterReveal />
      <div className="ft-wrap">
        <div className="ft-close">
          {site.tagline && <p className="ft-line" data-ft>{site.tagline}</p>}
          <div className="ft-reach" data-ft>
            <a href={cta.href} className="ft-cta">{cta.label}<span aria-hidden="true"> &rarr;</span></a>
            <dl className="ft-contact">
              {site.phone && <div><dt>Call</dt><dd><a href={phoneHref} className="footer-link">{site.phone}</a></dd></div>}
              {site.email && <div><dt>Write</dt><dd><a href={`mailto:${site.email}`} className="footer-link">{site.email}</a></dd></div>}
              {site.hours && <div><dt>Visit</dt><dd>{site.hours}</dd></div>}
            </dl>
          </div>
        </div>

        <nav aria-label="Footer" className="ft-nav">
          <ul>
            {pages.map((l) => <li key={l.href} data-ft-link><NavLink href={l.href} className="footer-link">{l.label}</NavLink></li>)}
          </ul>
        </nav>

        <div className="ft-mark" aria-hidden="true" data-ft-mark>
          <ContentLogo image={site.logoDark} dark fluid />
        </div>

        <div className="ft-legal">
          <p>&copy; {site.name}</p>
          {legal.length > 0 && (
            <ul aria-label="Legal">
              {legal.map((l) => <li key={l.href}><NavLink href={l.href} className="footer-link">{l.label}</NavLink></li>)}
            </ul>
          )}
          <p>Private demonstration. Not a live website, and inquiries are not sent.</p>
        </div>
      </div>
    </footer>
  );
}
