# Photography plan

This plan defines one consistent visual world, so that every photograph looks as if it was taken at the same house in the same year. The asset inventory below was the brief; the final collection is recorded at the end.

## Visual standard (applies to every asset)

- **Place:** Pacific Northwest. Evergreens, water, cedar, stone, warm oak and soft daylight. No palm trees, desert, snow-capped peaks dominating the frame, or obviously non-US settings.
- **Light:** natural, directional, low sun (early morning or late afternoon), or overcast softness for interiors. No flash, no HDR, no heavy filters.
- **Color:** muted, true-to-life greens, greys and warm woods. Cool, blue-leaning shadows sit well with the Midnight and Royal palette. Avoid saturated orange grading.
- **People:** older adults aged roughly 70 to 90, active, dressed in their own clothes, doing real things. Mixed genders and ethnicities across the set. Never posed laughing at the camera, never shown as frail or passive, and no scrubs, wheelchairs as props or clinical equipment.
- **Quality:** a long edge of at least 3000px (heroes 5000px or more), sharp focus and no watermarks, blur, upscaling or visible compression.
- **Rights:** licensed for commercial web use, with model releases for identifiable people. Record each asset as described below.

## Asset inventory

Key: **L** landscape, **P** portrait. Min = minimum long edge in pixels. The section key matches a content `section.key` or homepage `chapters[].key`.

| ID | Subject | Composition | Orient. | Min | Light / tone | Usage (section key) | Motion use | Relationship |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H01 | Lake at first light through trees | Wide; trees frame both edges, water in lower third | L | 6000 | Dawn, cool silver | Home `arrival` hero | Slow push-in; first frame of the scroll sequence | Opens the story; matches H02 light |
| H02 | Residence exterior from the lake | Building in the upper half, water reflection below | L | 6000 | Golden hour from the left | Home `surroundings`, Our home `architecture` | Parallax layers (water, house, trees) | Same building as H03 and H04 |
| H03 | Front entrance, door open, warm light inside | Centered doorway, symmetrical | P | 4000 | Dusk, interior glow | Home `entrance`; arched frame candidate | Doorway wipe into H05 (later WebGL transition) | Pairs with the Threshold mark |
| H04 | Covered porch along the lakeside | Leading lines along the eaves | L | 4000 | Soft overcast | Our home `shore` | Horizontal scroll pan | Bridges exterior and interior |
| H05 | Commons with fireplace, residents chatting | Mid-wide, people off-center | L | 5000 | Window light from the right, fire glow | Home `entrance`, Our home `commons` | Full-screen reveal after H03 | First interior and first people |
| H06 | Library reading chair by window | Close-mid, single figure reading | P | 3500 | Side window light | Our home `rooms` | Static | Quiet counterpoint to H05 |
| H07 | Garden Room sunroom with plants and coffee | Detail-rich mid shot | L | 4000 | Bright, diffuse | Our home `rooms`, Lifestyle `rhythm` | Static | Morning in the day sequence |
| H08 | Studio, watercolor class | Over-the-shoulder, hands and work | L | 4000 | Skylight, even | Lifestyle `interests`, Home `everyday` | Image sequence frame | Activity set A |
| H09 | Studio suite furnished with personal pieces | Wide from the doorway, window visible | L | 5000 | Daylight from the window | Accommodations `suites` | Slow crossfade between suites | Suite set (H09 to H11) |
| H10 | One-bedroom sitting room, family visiting | Mid shot, two generations | L | 5000 | Afternoon | Accommodations `personal`, Home `family` | Static | Links suites to family |
| H11 | Lakeside suite window view | Interior framing the lake | P | 4000 | Late afternoon | Accommodations `suites`, Home `spaces` | Window mask reveal | Echoes H01 water |
| H12 | Private bathroom detail | Clean, residential, no grab-bar emphasis | P | 3000 | Soft, even | Accommodations `included` | Static | Practical detail |
| H13 | Dining Room set for lunch, courtyard beyond | Wide, depth through windows | L | 5000 | Midday | Dining `day`, Home `dining` | Parallax | Dining set (H13 to H15) |
| H14 | Seasonal plated dish (salmon, vegetables) | Overhead or 45 degrees, linen and wood | L | 4000 | Window light, natural | Dining `kitchen` | Static | Food detail |
| H15 | Residents and family at a long table | Candid, mid-conversation | L | 5000 | Warm evening | Dining `together` | Full-screen | Social peak of the story |
| H16 | Courtyard garden with raised beds | Wide, the U-shaped building around it | L | 5000 | Morning | Home `outdoors`, Amenities `outdoor` | Scroll-scrubbed light change | Matches the Courtyard concept |
| H17 | Resident gardening at a seated-height bed | Close-mid, hands in soil | P | 3500 | Morning side light | Lifestyle `interests` | Static | Activity set B |
| H18 | Fire table on a cool evening | Mid, blankets, two residents | L | 4000 | Blue hour, fire glow | Home `outdoors` | Static | Seasonal warmth |
| H19 | Lakeside path with bench | Leading line to the water | L | 4000 | Overcast | Our home `shore`, Amenities `outdoor` | Horizontal pan | Walkability |
| H20 | Walking group on the path | Group from behind or side, moving | L | 4000 | Soft daylight | Lifestyle `interests`, Care `services` | Static | Movement and wellbeing |
| H21 | Team member and resident in conversation | Eye level, equal footing | L | 4000 | Interior daylight | Our team `roles`, Care `approach` | Static | Support without clinical cues |
| H22 | Interior architectural detail (oak, plaster, handrail) | Abstract crop | P | 3000 | Raking light | Our home `design` | Texture layer behind type | Ties the building together |
| H23 | Dock at sunset | Minimal, a long horizon | L | 6000 | Sunset | Home `invitation` | Final fade to the CTA | Closes the loop with H01 |
| H24 | Ferry or garden outing | Residents on an outing | L | 4000 | Daylight | Lifestyle `outings` | Static | Life beyond the house |
| H25 | Autumn and winter exterior variants of H02 | Same angle as H02 | L | 6000 | Seasonal | Gallery `exterior` | Season switcher | Gallery seasons |

Gallery categories draw from the full set: exterior (H02, H04, H25), interior (H05 to H07, H22), suites (H09 to H12), dining (H13 to H15), activities and life (H08, H17, H20, H24), and surroundings (H01, H19, H23).

## Provenance record

Provenance is recorded per image in `src/content/photos.generated.json` (provider, Pexels id, source page, photographer, license, license URL and download date), written by `scripts/photos/build.mjs`. Curated alt text, usage, motion role and focal point live in `src/content/photos.ts`. In Sanity, the same record maps to `figure.source`:

`figure.source` format: `<source> / <creator> / <license> / <id>`. It is never rendered. Credits are shown only where a license requires attribution.

## Final collection (Milestone 2)

56 accepted photographs, all Pexels License (commercial use, no attribution required, no visible credits).

| Category | Count | Added in the completion pass |
| --- | --- | --- |
| Exterior | 9 | stone-and-cedar side of the residence, cedar shingle detail, glass gallery in the trees |
| Surroundings | 3 | none |
| Interiors | 6 | Library with fireplace, clerestory lounge, open front doors |
| Accommodations | 7 | five suites: pines view, through the doorway, dresser and mirror, bedroom with bath, garden doors |
| Dining | 8 | none |
| Lifestyle | 14 | none |
| Outdoors | 9 | covered timber walkway, fire table on a deck; three-story courtyard withdrawn |

Workflow: `scripts/photos/search.mjs` (Pexels contact sheets) to visual review of each candidate at full size and a 100 percent crop, then `assets/photos/selection.json` and `scripts/photos/build.mjs` (originals to `assets/photos/originals`, WebP q82 masters to `public/photos`: 3840px wide for exterior, surroundings and outdoors, 2560px for other landscapes, 3200px tall for portraits; no upscaling). `scripts/photos/review.mjs` builds thumbnail and center-crop sheets of the optimized set.

Storage: originals 218 MB (gitignored, not served); optimized masters 42 MB.

Rejected: 36 candidates with reasons in `assets/photos/rejected.json`, including the first-pass courtyard (three stories, contradicts the two-story residence), inflatable mattresses, legible foreign-language signage and titles, tropical planting, luxury villas, monochrome conversions, apartment blocks and grain or soft focus.

Open gaps (reported rather than filled with unsuitable images):
- No two-story courtyard establishing shot. The courtyard is shown through the covered walkway and fire table; replace with real photography.
- No suite with a lake view. The lakeside suite uses a garden-facing suite with glass doors.
- Only one fire table photograph (an overhead deck view, not in a courtyard).

Replacement: every image is illustrative stock and must be replaced with commissioned photography of the real community before launch (see `docs/launch-inventory.md`).
