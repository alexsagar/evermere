"use client";

import { NavLink } from "./NavLink";
import { useRef } from "react";

/**
 * Small screens: a full-screen menu in a native modal <dialog>, which provides the
 * focus trap, Escape and inert background. Scrolling is locked by CSS
 * (:root:has(.menu[open])), so there is nothing to clean up on close.
 */
export function MobileMenu({ links, cta }: { links: { label: string; href: string }[]; cta: { label: string; href: string } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  return (
    <>
      <button type="button" className="menu-button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        Menu
      </button>
      <dialog ref={dialog} className="menu surface-dark" aria-label="Menu" data-lenis-prevent="">
        <div className="menu-top">
          <button type="button" className="menu-button menu-close" onClick={close} autoFocus>Close</button>
        </div>
        <nav aria-label="Main">
          <ul className="menu-links">
            {links.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                <NavLink href={l.href} onClick={close}>{l.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <a href={cta.href} className="btn btn-inverse menu-cta" onClick={close}>{cta.label}</a>
      </dialog>
    </>
  );
}
