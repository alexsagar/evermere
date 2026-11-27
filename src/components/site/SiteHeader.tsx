import Link from "next/link";
import { NavLink } from "./NavLink";
import { ContentLogo } from "@/components/brand/ContentLogo";
import type { ContentImage } from "./Img";
import { HeaderState } from "./HeaderState";
import { MobileMenu } from "./MobileMenu";
import "./site.css";

type NavItem = { label?: string | null; href?: string | null };

/**
 * Transparent over the hero, opaque White once the hero has passed (HeaderState
 * toggles `data-solid`). Without JavaScript it is always opaque.
 */
export function SiteHeader({ links, cta, siteName, logo, logoDark }: { links: NavItem[]; cta: { label: string; href: string }; siteName: string; logo?: ContentImage; logoDark?: ContentImage }) {
  const items = links.filter((l): l is { label: string; href: string } => Boolean(l.label && l.href));
  return (
    <header className="site-header" data-solid="">
      <HeaderState />
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label={`${siteName}, home`}>
          <span className="logo-dark"><ContentLogo image={logo} height={40} /></span>
          <span className="logo-light" aria-hidden="true"><ContentLogo image={logoDark} dark height={40} /></span>
        </Link>
        <nav aria-label="Main" className="site-nav">
          <ul>
            {items.map((l) => (
              <li key={l.href}><NavLink href={l.href}>{l.label}</NavLink></li>
            ))}
          </ul>
        </nav>
        <a href={cta.href} className="site-cta">{cta.label}</a>
        <MobileMenu links={items} cta={cta} />
      </div>
    </header>
  );
}
