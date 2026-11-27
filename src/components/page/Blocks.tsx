import Link from "next/link";
import { INQUIRY_HREF } from "@/components/site/links";
import type { Section } from "./page";

type L = { label?: string | null; href?: string | null } | null | undefined;

/** A content link. Inquiry links route to the Contact inquiry panel. */
export function CtaLink({ link, className = "text-link", inquiry }: { link: L; className?: string; inquiry?: boolean }) {
  if (!link?.href || !link.label) return null;
  const href = inquiry || link.href === "/contact" ? INQUIRY_HREF : link.href;
  return <Link href={href} className={className}>{link.label}</Link>;
}

/** Body paragraphs of a section. */
export function Paras({ s, className }: { s: Section; className?: string }) {
  return <>{s.body?.map((b) => <p key={b} className={className}>{b}</p>)}</>;
}

/** The section's points as a plain list; "Name: text" points get a bold name. */
export function Points({ s, className = "pg-points" }: { s: Section; className?: string }) {
  if (!s.points?.length) return null;
  return (
    <ul className={className}>
      {s.points.map((p) => {
        const i = p.indexOf(": ");
        return <li key={p}>{i > 0 && i < 40 ? <><strong>{p.slice(0, i)}</strong>{p.slice(i + 1)}</> : p}</li>;
      })}
    </ul>
  );
}

/**
 * Page ending, shaped by page type:
 * "next" leads with the next chapter of the tour and a visit action,
 * "invite" closes on Midnight with the page's inquiry action,
 * "quiet" is a small reference row for documents and help pages.
 */
export function Related({ links, cta, variant = "quiet" }: { links?: L[] | null; cta?: L; variant?: "next" | "invite" | "quiet" }) {
  const valid = (links ?? []).filter((l) => l?.href && l?.label);
  if (!valid.length) return null;
  const items = <ul>{valid.map((l) => <li key={l!.href}><CtaLink link={l} className="pg-related-link" /></li>)}</ul>;
  if (variant === "next") {
    const [first, ...rest] = valid;
    return (
      <nav aria-label="Related pages" className="pg-related pg-related-next">
        <p className="pg-related-title">Next</p>
        <CtaLink link={first} className="pg-related-lead" />
        {rest.length ? <ul>{rest.map((l) => <li key={l!.href}><CtaLink link={l} className="pg-related-link" /></li>)}</ul> : null}
        <CtaLink link={cta} className="btn btn-primary pg-related-cta" inquiry />
      </nav>
    );
  }
  if (variant === "invite") {
    return (
      <nav aria-label="Related pages" className="pg-related pg-related-invite">
        <CtaLink link={cta} className="btn pg-related-cta" inquiry />
        <div><p className="pg-related-title">Read on</p>{items}</div>
      </nav>
    );
  }
  return (
    <nav aria-label="Related pages" className="pg-related">
      <p className="pg-related-title">Related</p>
      {items}
    </nav>
  );
}
