import { concepts, type Concept } from "@/brand/marks";
import { lockup, mark, smallMark, variants, wordmark, type LogoVariant } from "@/brand/logo";

type MarkProps = {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  /** Use the simplified small-size mark (auto below 28px). */
  small?: boolean;
  /** Milestone 1 concept, for the internal review archive only. */
  concept?: Concept["id"];
};

export function Mark({ variant = "primary", size = 48, className, small, concept }: MarkProps) {
  const c = variants[variant];
  const archived = concept && concept !== "threshold" ? concepts.find((x) => x.id === concept) : null;
  const m = archived ?? ((small ?? size < 28) ? smallMark : mark);
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true" data-mark={concept ?? "threshold"}>
      <path fill={c.body} fillRule="evenodd" d={m.body} />
      <path fill={c.accent} d={m.accent} />
    </svg>
  );
}

/** Horizontal lockup with the outlined wordmark. `height` is the rendered height in px. */
export function Logo({ variant = "primary", height = 40, className }: { variant?: LogoVariant; height?: number; className?: string }) {
  const c = variants[variant];
  return (
    <svg
      viewBox={`0 0 ${lockup.width} ${lockup.height}`}
      height={height}
      width={(height * lockup.width) / lockup.height}
      className={className}
      role="img"
      aria-label="Evermere Senior Living"
      data-logo={variant}
    >
      <path fill={c.body} fillRule="evenodd" d={mark.body} />
      <path fill={c.accent} d={mark.accent} />
      <path fill={c.name} d={wordmark.name.d} />
      <path fill={c.descriptor} d={wordmark.descriptor.d} />
    </svg>
  );
}
