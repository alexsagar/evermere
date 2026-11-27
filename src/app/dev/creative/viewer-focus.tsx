"use client";

import { useEffect } from "react";

// Focus management for the :target image viewers: focus moves into an opened
// viewer, Tab stays inside it, Escape closes it and focus returns to the thumbnail.
export function ViewerFocus() {
  useEffect(() => {
    let opener: HTMLElement | null = null;
    const open = () => (location.hash.startsWith("#view-") ? document.getElementById(location.hash.slice(1)) : null);

    const onHash = () => {
      const viewer = open();
      if (viewer) {
        opener = document.querySelector<HTMLElement>(`a[href="${location.hash}"]`);
        viewer.querySelector<HTMLElement>(".viewer-close")?.focus();
      } else if (opener) {
        opener.focus();
        opener = null;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const viewer = open();
      if (!viewer) return;
      if (e.key === "Escape") {
        e.preventDefault();
        location.hash = "#collection";
      } else if (e.key === "Tab") {
        const items = [...viewer.querySelectorAll<HTMLElement>("a[href], [tabindex='0']")];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    addEventListener("hashchange", onHash);
    addEventListener("keydown", onKey);
    onHash();
    return () => {
      removeEventListener("hashchange", onHash);
      removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
