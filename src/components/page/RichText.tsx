import Link from "next/link";
import type { RichText as RichTextValue } from "@/sanity/types";

type Block = RichTextValue[number];

function spans(b: Block) {
  return (b.children ?? []).map((c) => {
    const href = c.marks?.map((m) => b.markDefs?.find((d) => d._key === m)?.href).find(Boolean);
    if (!href) return c.text;
    return href.startsWith("/")
      ? <Link key={c._key} href={href} className="link">{c.text}</Link>
      : <a key={c._key} href={href} className="link">{c.text}</a>;
  });
}

/** Renders the Portable Text subset the content model uses: paragraphs, h3 and bullets. */
// `top` renders content headings as h2 where the body sits directly under the page h1 (articles).
export function RichText({ value, className = "", top }: { value?: RichTextValue | null; className?: string; top?: boolean }) {
  const H = top ? "h2" : "h3";
  if (!value?.length) return null;
  const out: React.ReactNode[] = [];
  let list: Block[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={`ul-${list[0]._key}`}>{list.map((b) => <li key={b._key}>{spans(b)}</li>)}</ul>);
    list = [];
  };
  for (const b of value) {
    if (b.listItem) { list.push(b); continue; }
    flush();
    out.push(b.style === "h3" ? <H key={b._key} className="prose-h">{spans(b)}</H> : <p key={b._key}>{spans(b)}</p>);
  }
  flush();
  return <div className={`prose ${className}`}>{out}</div>;
}
