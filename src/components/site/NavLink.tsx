"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/** A navigation link that marks itself as the current page (and its children, e.g. articles). */
export function NavLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const path = usePathname();
  const current = path === href || (href !== "/" && path.startsWith(`${href}/`));
  return <Link href={href} aria-current={current ? "page" : undefined} {...props} />;
}
