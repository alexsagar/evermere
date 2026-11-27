import { notFound } from "next/navigation";

/**
 * Call first in every lab page. Pages render in parallel with the layout, so the
 * layout's notFound() alone does not keep page content out of a production 404.
 */
export function devOnly() {
  if (process.env.NODE_ENV === "production") notFound();
}
