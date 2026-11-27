# Evermere brand guide (demonstration)

Evermere Senior Living is a fictional brand created for this demonstration. It has not been trademark-checked, and it will be replaced by the client's real identity before any public launch. The live review page is at `/dev/brand` (available in development only).

## Idea

A *mere* is an old English word for a lake. Evermere describes one home on one shoreline, open to the people who live there and to the people who visit them. The brand should feel like a well-designed Northwest house: warm materials, calm order, plenty of light. It should never feel like a hospital, a real estate listing or a healthcare company.

Personality: warm, independent, belonging, composed, trustworthy.

## Logo concepts

All three are original geometric marks drawn on a 48-unit grid. Source geometry is in `src/brand/marks.ts`. Run `node scripts/export-logos.mts` to export SVGs to `public/brand/<concept>/`.

| Concept | Idea | Strength | Risk |
| --- | --- | --- | --- |
| Threshold (recommended) | Arched doorway with the door swung open | Warmest, most ownable; the arch becomes a recurring photo frame | Arch forms are common in hospitality; keep the open door distinctive |
| Continuum | E monogram as a floor plan; the middle bar stands apart | Most legible at 16px, strong favicon | Reads cooler and more corporate |
| Courtyard | The residence in plan: four wings around a garden | Literally describes the property | Can read as a technical or focus icon at small sizes |

Each concept has a mark and a horizontal lockup in five versions: primary (Midnight and Royal), on Lavender (Midnight descriptor), reversed (White and Lavender on dark), Midnight single color and White single color. The wordmark in the SVG files uses live Manrope text; convert it to outlines once a concept is chosen. Clear space around the mark is at least one quarter of its height. Minimum size is 16px for the mark and 28px mark height for the horizontal lockup.

## Color

| Token | Hex | Role |
| --- | --- | --- |
| `midnight` | #18243D | Text, dark surfaces, the mark |
| `royal` | #4564B4 | Actions, links, accent in the mark |
| `lavender` | #DCDFF5 | Quiet surfaces, text on dark |
| `cloud` | #F5F7FC | Default page background |
| `white` | #FFFFFF | Raised surfaces, text on dark |

Contrast pairs and their approved use are defined in `src/brand/tokens.ts` and checked by `src/brand/tokens.test.ts`. The key rules are:

- Midnight works for text on every light color (12.4:1 or better).
- Royal works for text on White (5.6:1) and Cloud (5.2:1), but only for large text on Lavender (4.3:1).
- White, Cloud and Lavender work for text on Midnight, and White works on Royal (5.6:1).
- Never put Royal on Midnight (2.7:1) or Lavender on Royal. The mark switches to its reversed version on dark backgrounds.

## Typography

Manrope variable is the only typeface, self-hosted from `src/fonts`. Weights range from 450 to 700. There are no italics and no decorative capitals. Tokens: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body` (18px) and `text-small`. Large type is set tight with negative tracking; body text has 1.65 line height. Keep measures at 75 characters or fewer.

## Form

- **Corners:** square layout blocks and photography. Buttons and inputs use a 2px radius. One arched image frame per page, echoing the Threshold door, is the only curve.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 144, 208. Sections breathe; use generous vertical space and asymmetric 12-column compositions.
- **Buttons:** `btn-primary` (Royal, turns Midnight on hover), `btn-secondary` (Midnight outline), `btn-inverse` (White on dark). Minimum height is 48px. The label states the action: "Arrange a visit", "Ask about availability".
- **Focus:** a 2px Royal outline with a 3px offset, which switches to Lavender on dark surfaces (`.surface-dark`).
- **Icons:** used sparingly. 24px grid, 2px stroke, square caps, Midnight or Royal.
- **Motion:** slow, eased and purposeful (200 to 600ms, soft ease-out). Scroll storytelling reveals photography rather than animating text. Every effect has a still fallback for reduced motion.

## Voice

We write to prospective residents first and to their families second, as adults making their own decisions. The voice is warm but not sentimental, professional but not corporate, reassuring but not patronizing, and premium but not elitist.

Do:
- Name real places and moments: the Commons, the porch, a card game that runs long.
- Use plain verbs and short sentences. Say what happens next.
- Offer choice ("if you like", "your choice") and respect privacy.
- When something depends on circumstances, say so and invite a conversation.

Avoid:
- "Loved one" as a default (use it sparingly), "elderly", "seniors" as a label, and anything that presents older adults as dependent.
- Superlatives and unverifiable claims: "best", "unparalleled", "award-winning", "state-of-the-art".
- Emotional slogans, "every moment", "golden years", "peace of mind" repeated as filler.
- Medical promises, licensing claims, prices or availability figures.
