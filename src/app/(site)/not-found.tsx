import Link from "next/link";
import { getNavigation } from "@/content";

// Branded 404 body. Rendered inside the site layout when a page calls notFound()
// (e.g. an unknown article), and inside the root 404 for unmatched URLs.
export default async function NotFound() {
  const nav = await getNavigation();
  return (
    <div className="nf">
      <div className="nf-arch" aria-hidden="true" />
      <div>
        <h1 className="pg-h1">This door does not lead anywhere.</h1>
        <p className="pg-lead">The page you were looking for is not here. It may have moved, or the address may be mistyped.</p>
        <ul className="nf-links">
          <li><Link href="/" className="btn btn-primary">Go to the home page</Link></li>
          {(nav.primary ?? []).map((l) => l.href && <li key={l.href}><Link href={l.href} className="text-link">{l.label}</Link></li>)}
        </ul>
      </div>
    </div>
  );
}
