"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// After a client navigation between lab routes, focus moves to the new page's
// main heading. Never on the first load.
export function RouteFocus() {
  const path = usePathname();
  const last = useRef(path);
  useEffect(() => {
    if (last.current === path) return;
    last.current = path;
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (!h1) return;
    h1.tabIndex = -1;
    h1.focus({ preventScroll: true });
  }, [path]);
  return null;
}
