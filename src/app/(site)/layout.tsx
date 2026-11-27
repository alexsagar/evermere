import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { INQUIRY_HREF } from "@/components/site/links";
import { ViewTransition } from "react";
import { getNavigation, getSiteSettings } from "@/content";
import { SmoothScroll } from "@/motion/SmoothScroll";
import "@/components/page/pages.css";
import "@/components/page/pages-b.css";


export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [site, nav] = await Promise.all([getSiteSettings(), getNavigation()]);
  const cta = { label: nav.cta?.label ?? "Arrange a visit", href: INQUIRY_HREF };
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <SiteHeader links={nav.primary ?? []} cta={cta} siteName={site.name ?? ""} logo={site.logo} logoDark={site.logoDark} />
      {/* Route changes crossfade the page body (220ms); the header stays put. Browsers
          without View Transitions, and reduced motion, simply swap pages. */}
      <ViewTransition default="page-fade">
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      </ViewTransition>
      <SiteFooter site={site} primary={nav.primary ?? []} secondary={nav.footer ?? []} cta={cta} />
    </>
  );
}
