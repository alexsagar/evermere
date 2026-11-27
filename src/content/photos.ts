import generated from "./photos.generated.json";

// Central, typed photography manifest for the local demonstration.
// Curated fields live here; measured size and provenance come from
// photos.generated.json (written by scripts/photos/build.mjs). Stock photographs
// are licensed illustrations of a fictional property: they do not depict the
// client's building, residents or staff.

export type PhotoCategory = "exterior" | "surroundings" | "interiors" | "accommodations" | "dining" | "lifestyle" | "outdoors";

type Curated = {
  category: PhotoCategory;
  alt: string;
  usage: string;
  /** Planned motion role, for the animation lab. */
  motion: string;
  /** Focal point, 0 to 1 from the top left. Mirrors the Sanity image hotspot. */
  focal: { x: number; y: number };
  /** Contains identifiable people. Never present them as residents or staff. */
  people?: true;
};

const curated = {
  "exterior-residence-pines": { category: "exterior", alt: "A two-story contemporary residence of timber, dark stone and glass among tall pines, with a stone path across the lawn to the entrance.", usage: "Home arrival and surroundings; Our home opening", motion: "Plate A of the exterior sequence; doorway-mask push toward the entrance", focal: { x: 0.46, y: 0.42 } },
  "exterior-residence-garden-side": { category: "exterior", alt: "The same residence seen between pine trunks, with stepping stones leading to glass doors.", usage: "Home surroundings; Our home architecture", motion: "Plate B of the exterior sequence; parallax with foreground trunks", focal: { x: 0.5, y: 0.4 } },
  "exterior-residence-evening-pines": { category: "exterior", alt: "Late sun on the timber and stone walls of the residence, with long windows on both floors.", usage: "Our home architecture; gallery", motion: "Plate C of the exterior sequence; light-shift crossfade", focal: { x: 0.52, y: 0.4 } },
  "exterior-entrance-cedar": { category: "exterior", alt: "A covered entrance clad in warm cedar boards beside a stone column, with plants in the foreground.", usage: "Home entrance; arched frame candidate", motion: "Threshold doorway expansion from the logo arch into this frame", focal: { x: 0.5, y: 0.55 } },
  "exterior-cedar-slats-sky": { category: "exterior", alt: "Horizontal cedar slats stepping out against a clear blue sky.", usage: "Our home design detail; texture plate", motion: "Slow vertical drift behind type", focal: { x: 0.45, y: 0.5 } },
  "exterior-slatted-garden-walk": { category: "exterior", alt: "A gravel walk between slatted timber screens leading toward a glass door.", usage: "Our home rooms; Amenities opening", motion: "Perspective push down the walk", focal: { x: 0.5, y: 0.6 } },
  "exterior-residence-stone-cedar": { category: "exterior", alt: "A two-story house of cedar boards and dark stone panels among pines, with long windows facing a sunlit lawn.", usage: "Our home architecture; gallery exterior", motion: "Plate D of the exterior sequence; slow lateral drift", focal: { x: 0.5, y: 0.45 } },
  "exterior-cedar-shingle-light": { category: "exterior", alt: "Low evening sun across weathered cedar shingles and a row of small lit windows.", usage: "Our home design detail; Home invitation texture", motion: "Raking-light texture plate behind type", focal: { x: 0.5, y: 0.45 } },
  "exterior-glass-gallery-forest": { category: "exterior", alt: "A long timber-framed glass gallery raised on stone footings among autumn trees.", usage: "Our home rooms (Garden Room exterior); gallery exterior", motion: "Parallax between foreground trunks and the glass", focal: { x: 0.4, y: 0.5 } },

  "surroundings-lake-mist-shore": { category: "surroundings", alt: "A still lake under morning mist, with dark evergreens reflected along the far shore.", usage: "Home opening hero; first frame of the journey", motion: "WebGL mist displacement on load; slow push-in", focal: { x: 0.5, y: 0.55 } },
  "surroundings-lake-dawn-pines": { category: "surroundings", alt: "Tall pines on a point of land at dawn, with mist lifting off calm water.", usage: "Home surroundings; Lifestyle rhythm", motion: "Horizontal pan; transition plate between exterior and welcome", focal: { x: 0.62, y: 0.5 } },
  "surroundings-dock-first-light": { category: "surroundings", alt: "A wooden dock and swim platform on glassy water at first light, with pines on the far shore.", usage: "Home invitation; Contact opening", motion: "Final fade from photograph to the inquiry panel", focal: { x: 0.55, y: 0.62 } },

  "interiors-commons-fireplace": { category: "interiors", alt: "A bright living room with a stacked-stone fireplace and tall windows looking into the trees.", usage: "Home entrance; Our home commons", motion: "Exterior-to-interior reveal target behind the doorway mask", focal: { x: 0.62, y: 0.5 } },
  "interiors-commons-tall-windows": { category: "interiors", alt: "A double-height sitting room with a fireplace, comfortable chairs and walls of windows.", usage: "Our home commons; gallery interiors", motion: "Vertical rise revealing the double-height space", focal: { x: 0.55, y: 0.55 } },
  "interiors-garden-room": { category: "interiors", alt: "A glass-walled garden room with woven chairs, cushions and potted plants facing tall trees.", usage: "Our home rooms (Garden Room); Lifestyle rhythm", motion: "Window-grid mask reveal", focal: { x: 0.5, y: 0.55 } },
  "interiors-library-fireplace": { category: "interiors", alt: "A library with floor-to-ceiling bookshelves, wing chairs beside a tiled fireplace and tall windows onto evergreens.", usage: "Our home rooms (Library); Lifestyle quiet", motion: "Warm lamplight crossfade at dusk", focal: { x: 0.45, y: 0.5 } },
  "interiors-lounge-clerestory": { category: "interiors", alt: "A bright sitting room with a pale sofa, woven chairs and a row of high windows onto pine trees.", usage: "Amenities house; gallery interiors", motion: "Static; window-row mask reveal", focal: { x: 0.5, y: 0.55 } },
  "interiors-front-door-open": { category: "interiors", alt: "Double wooden front doors stand open from a hallway onto a covered porch and tall pines.", usage: "Contact visiting; Through the Door motif", motion: "Doorway frame for the threshold transition", focal: { x: 0.5, y: 0.5 } },

  "accommodations-studio-suite": { category: "accommodations", alt: "A light-filled suite with pale wood floors, a reading chair, a bed and a wall of windows.", usage: "Accommodations suites; Home spaces", motion: "Suite sequence plate; crossfade with the bathroom detail", focal: { x: 0.5, y: 0.5 } },
  "accommodations-bathroom-shower": { category: "accommodations", alt: "A walk-in shower lined with wood-look tile behind a clear glass panel.", usage: "Accommodations included features", motion: "Static detail", focal: { x: 0.5, y: 0.5 } },
  "accommodations-suite-pines": { category: "accommodations", alt: "A spacious suite with a bed, a reading chair and a wide window onto pine woods, on pale oak floors.", usage: "Accommodations one-bedroom suite; Home spaces", motion: "Suite sequence plate; slow push toward the window", focal: { x: 0.45, y: 0.5 } },
  "accommodations-suite-doorway": { category: "accommodations", alt: "A suite seen through its open door, with two armchairs, a side table and a shuttered window.", usage: "Accommodations opening", motion: "Through the Door frame; door edge wipes aside", focal: { x: 0.35, y: 0.55 } },
  "accommodations-suite-forest-mirror": { category: "accommodations", alt: "A walnut dresser and a tall mirror reflecting the bed, beside a window onto the woods.", usage: "Accommodations personal; gallery suites", motion: "Static detail", focal: { x: 0.45, y: 0.5 } },
  "accommodations-suite-bedroom-bath": { category: "accommodations", alt: "A suite bedroom with an upholstered bed, bedside lamps and a door open to a private bathroom.", usage: "Accommodations included features; gallery suites", motion: "Static", focal: { x: 0.45, y: 0.55 } },
  "accommodations-suite-garden-doors": { category: "accommodations", alt: "A large suite with a low bed, two chairs by the window and sliding glass doors to a planted balcony.", usage: "Accommodations lakeside suite", motion: "Light-shift crossfade toward the glass doors", focal: { x: 0.55, y: 0.5 } },

  "dining-room-forest-windows": { category: "dining", alt: "A dining room with a long wooden table beneath a pendant light and windows onto bare winter trees.", usage: "Dining opening; Home dining", motion: "Table-height dolly toward the windows", focal: { x: 0.5, y: 0.55 } },
  "dining-room-garden-light": { category: "dining", alt: "A wooden table and chairs by floor-to-ceiling glass doors opening onto a green garden.", usage: "Dining day; Our home dining room", motion: "Light-shift crossfade from morning to midday", focal: { x: 0.45, y: 0.6 } },
  "dining-salmon-plate": { category: "dining", alt: "A crusted salmon fillet on whipped potatoes with lemon and herbs in a handmade ceramic bowl.", usage: "Dining kitchen", motion: "Static; slow scale on hover only", focal: { x: 0.48, y: 0.55 } },
  "dining-seasonal-plate": { category: "dining", alt: "Roasted carrots and sliced duck with a bright herb oil on a white plate, seen from above.", usage: "Dining seasons", motion: "Overhead plate sequence frame", focal: { x: 0.5, y: 0.5 } },
  "dining-summer-salad": { category: "dining", alt: "A summer salad of tomatoes, shaved cucumber and herbs on a white plate, seen from above.", usage: "Dining seasons", motion: "Overhead plate sequence frame", focal: { x: 0.5, y: 0.5 } },
  "dining-morning-coffee": { category: "dining", alt: "A cup of coffee on a wooden table in low morning sunlight.", usage: "Dining day (breakfast); Lifestyle rhythm", motion: "Light-leak crossfade", focal: { x: 0.55, y: 0.6 } },
  "dining-breakfast-table": { category: "dining", alt: "Croissants, butter and mugs of coffee on a sunlit breakfast table.", usage: "Dining choice", motion: "Static", focal: { x: 0.4, y: 0.6 } },
  "dining-couple-toast": { category: "dining", alt: "An older couple raise glasses of red wine across a table by a window.", usage: "Dining together; Home dining", motion: "Static", focal: { x: 0.55, y: 0.4 }, people: true },

  "lifestyle-reading-window": { category: "lifestyle", alt: "A woman reads in a wooden armchair beside a sunny window lined with plants.", usage: "Lifestyle quiet; Accommodations personal", motion: "Static", focal: { x: 0.72, y: 0.5 }, people: true },
  "lifestyle-coffee-window": { category: "lifestyle", alt: "A woman sips coffee in an armchair by a window with plants on the sill.", usage: "Lifestyle rhythm", motion: "Paired plate with lifestyle-reading-window", focal: { x: 0.7, y: 0.45 }, people: true },
  "lifestyle-reading-smile": { category: "lifestyle", alt: "A smiling older man reads a hardback book, resting his chin on his hand.", usage: "Lifestyle interests (Library)", motion: "Static", focal: { x: 0.45, y: 0.4 }, people: true },
  "lifestyle-reading-armchair": { category: "lifestyle", alt: "An older woman in a white robe reads in a wingback chair.", usage: "Accommodations personal; Lifestyle quiet", motion: "Static", focal: { x: 0.5, y: 0.4 }, people: true },
  "lifestyle-watercolor-window": { category: "lifestyle", alt: "A person paints in watercolor at a sunny window beside a vase of lilies.", usage: "Lifestyle interests (Studio); Home everyday", motion: "Image sequence frame with the brush detail", focal: { x: 0.65, y: 0.45 }, people: true },
  "lifestyle-brush-detail": { category: "lifestyle", alt: "Close view of a hand painting a landscape in watercolor.", usage: "Lifestyle interests", motion: "Macro plate; scale-in from detail to wide", focal: { x: 0.45, y: 0.6 } },
  "lifestyle-cards-friends": { category: "lifestyle", alt: "Three women play cards around a small table with glasses of juice.", usage: "Lifestyle contribute; Home everyday", motion: "Static", focal: { x: 0.5, y: 0.45 }, people: true },
  "lifestyle-cards-couple": { category: "lifestyle", alt: "A woman and a man play cards at a round wooden table in a bright room.", usage: "Lifestyle rhythm", motion: "Static", focal: { x: 0.5, y: 0.45 }, people: true },
  "lifestyle-conversation-plants": { category: "lifestyle", alt: "A woman with short gray hair listens to a friend over coffee among tall plants.", usage: "About belief; Our team approach", motion: "Static", focal: { x: 0.4, y: 0.4 }, people: true },
  "lifestyle-piano": { category: "lifestyle", alt: "A man plays an upright piano from sheet music in a room with parquet floors.", usage: "Lifestyle music; Our home commons", motion: "Static", focal: { x: 0.55, y: 0.45 }, people: true },
  "lifestyle-stretch-class": { category: "lifestyle", alt: "Three women stretch on yoga mats in a bright studio with shelves of equipment.", usage: "Lifestyle movement; Care and support wellbeing", motion: "Static", focal: { x: 0.55, y: 0.55 }, people: true },
  "lifestyle-grandchild-photos": { category: "lifestyle", alt: "A grandfather and grandmother look at photographs with their granddaughter at the table.", usage: "Home family; Our team families", motion: "Static", focal: { x: 0.5, y: 0.4 }, people: true },
  "lifestyle-garden-harvest": { category: "lifestyle", alt: "A woman with long gray braids harvests lettuce from a raised vegetable bed.", usage: "Lifestyle garden; Home outdoors", motion: "Static", focal: { x: 0.45, y: 0.45 }, people: true },
  "lifestyle-garden-smile": { category: "lifestyle", alt: "A smiling woman in gardening gloves stands among foxgloves and shrubs.", usage: "Lifestyle garden", motion: "Static", focal: { x: 0.35, y: 0.4 }, people: true },

  "outdoors-kitchen-garden": { category: "outdoors", alt: "A kitchen garden with marigolds, kale and a wheelbarrow in morning sun.", usage: "Lifestyle garden; Dining kitchen", motion: "Static", focal: { x: 0.5, y: 0.55 } },
  "outdoors-lakeside-path": { category: "outdoors", alt: "A shaded path through pines along the lakeshore, with two benches facing the water.", usage: "Our home shore; Amenities outdoor", motion: "Forward path push", focal: { x: 0.45, y: 0.55 } },
  "outdoors-bench-misty-lake": { category: "outdoors", alt: "A simple log bench on the grass above a misty lake and wooded islands.", usage: "Home outdoors; FAQ and Resources opening", motion: "Static, quiet plate", focal: { x: 0.6, y: 0.6 } },
  "outdoors-chairs-dock": { category: "outdoors", alt: "Two dark Adirondack chairs on a wet dock facing a calm lake and forested hills.", usage: "Home invitation; Contact visiting", motion: "End frame of the journey; holds behind the inquiry invitation", focal: { x: 0.5, y: 0.55 } },
  "outdoors-walk-lakeside-trees": { category: "outdoors", alt: "An older couple walk together on a lakeside path between birch trees.", usage: "Home everyday; Lifestyle movement", motion: "Parallax between trunks and path", focal: { x: 0.6, y: 0.6 }, people: true },
  "outdoors-walk-path-together": { category: "outdoors", alt: "An older couple walk away along a tree-lined path by the water, arm in arm.", usage: "Care and support approach; About", motion: "Static", focal: { x: 0.6, y: 0.55 }, people: true },
  "outdoors-couple-by-water": { category: "outdoors", alt: "A smiling woman with silver hair stands with her partner by the water.", usage: "About belief; Home family", motion: "Static", focal: { x: 0.6, y: 0.5 }, people: true },
  "outdoors-timber-walkway": { category: "outdoors", alt: "A covered walkway under a warm timber ceiling, open on one side to a planted gravel garden with boulders.", usage: "Our home courtyard; Amenities outdoor", motion: "Forward push along the eave line", focal: { x: 0.45, y: 0.55 } },
  "outdoors-fire-table-deck": { category: "outdoors", alt: "Cushioned chairs and a sofa around a square stone fire table on a wooden deck, seen from above.", usage: "Home outdoors; gallery outdoors", motion: "Overhead plate; flame glow loop", focal: { x: 0.5, y: 0.5 } },
} satisfies Record<string, Curated>;

export type PhotoId = keyof typeof curated;

export type Photo = Curated & { id: PhotoId } & (typeof generated)[keyof typeof generated];

export const photos: Photo[] = (Object.keys(curated) as PhotoId[]).map((id) => ({
  id,
  ...curated[id],
  ...generated[id],
}));

export const photo = (id: PhotoId): Photo => photos.find((p) => p.id === id)!;
