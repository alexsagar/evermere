"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Variant links (`?v=`). Full page loads, so each variant starts from a clean state. */
export function VariantSwitch({ label, options }: { label: string; options: [string, string][] }) {
  const path = usePathname();
  const search = useSyncExternalStore(noop, () => location.search, () => "");
  const q = new URLSearchParams(search);
  const current = q.get("v") ?? options[0][0];
  return (
    <nav aria-label={label} className="lab-variants">
      {options.map(([v, text]) => {
        const next = new URLSearchParams(q);
        next.set("v", v);
        return (
          <a key={v} href={`${path}?${next}`} aria-current={v === current ? "true" : undefined}>{text}</a>
        );
      })}
      <a href={`${path}${search}`}>Replay</a>
    </nav>
  );
}
