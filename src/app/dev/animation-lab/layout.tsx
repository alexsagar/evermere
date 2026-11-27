import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { SmoothScroll } from "@/motion/SmoothScroll";
import { experiments } from "./experiments";
import { PreviewToggles } from "./PreviewToggles";
import { RouteFocus } from "./RouteFocus";
import "./lab.css";

export const metadata: Metadata = process.env.NODE_ENV === "production" ? {} : { title: "Animation lab | Evermere (internal)" };

// Development-only animation laboratory. Every route under it is a 404 in production.
export default function LabLayout({ children }: LayoutProps<"/dev/animation-lab">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="lab">
      <SmoothScroll />
      <RouteFocus />
      <header className="lab-bar">
        <Link href="/dev/animation-lab" aria-label="Animation lab index" className="shrink-0">
          <Logo height={28} />
        </Link>
        <nav aria-label="Experiments" className="lab-nav">
          <ul>
            {experiments.map((e, i) => (
              <li key={e.slug}><Link href={`/dev/animation-lab/${e.slug}`}>{i + 1}. {e.name}</Link></li>
            ))}
          </ul>
        </nav>
        <PreviewToggles />
      </header>
      {children}
    </div>
  );
}
