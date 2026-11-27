import type { RichText } from "@/sanity/types";

// Builds Portable Text from compact strings so demo content stays readable.
// "## Heading" makes an h3, "- item" a bullet, and [label](/href) a link.
export function pt(...paragraphs: string[]): RichText {
  return paragraphs.map((raw, i) => {
    const key = `b${i}`;
    const style = raw.startsWith("## ") ? "h3" : "normal";
    const listItem = raw.startsWith("- ") ? "bullet" : undefined;
    const text = raw.replace(/^(## |- )/, "");
    const markDefs: NonNullable<RichText[number]["markDefs"]> = [];
    const children: NonNullable<RichText[number]["children"]> = [];
    let last = 0;
    for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      if (m.index > last) children.push({ _type: "span", _key: `${key}s${children.length}`, text: text.slice(last, m.index) });
      const markKey = `${key}l${markDefs.length}`;
      markDefs.push({ _type: "link", _key: markKey, href: m[2] });
      children.push({ _type: "span", _key: `${key}s${children.length}`, text: m[1], marks: [markKey] });
      last = m.index + m[0].length;
    }
    if (last < text.length) children.push({ _type: "span", _key: `${key}s${children.length}`, text: text.slice(last) });
    return { _type: "block", _key: key, style, ...(listItem && { listItem, level: 1 }), markDefs, children };
  });
}

export function ptText(blocks: RichText | null): string {
  return (blocks ?? []).map((b) => (b.children ?? []).map((c) => c.text).join("")).join("\n\n");
}
