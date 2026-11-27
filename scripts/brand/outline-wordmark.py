"""Converts the Evermere wordmark text to SVG path outlines using the local Manrope font.

Shapes text with HarfBuzz (kerning included) at the exact weights, sizes and letter-spacing
used by the review lockup, then writes src/brand/wordmark.json for src/brand/marks.ts.

Run with the local tooling venv:
  .cache/venv/Scripts/python scripts/brand/outline-wordmark.py
(requires fonttools, brotli and uharfbuzz in that venv; not a project dependency)
"""

import json
from io import BytesIO

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONT = "src/fonts/Manrope-Variable.woff2"

# Same values as the Milestone 1 lockup: (text, x, baseline y, size, weight, letter-spacing).
LINES = {
    "name": ("Evermere", 62, 28, 27, 700, -0.5),
    "descriptor": ("Senior Living", 63, 44, 11.5, 600, 0.6),
}


def outline(text, x, y, size, weight, tracking):
    font = TTFont(FONT)
    font.flavor = None
    static = instantiateVariableFont(font, {"wght": weight})
    buf = BytesIO()
    static.save(buf)
    data = buf.getvalue()

    hb_font = hb.Font(hb.Face(data))
    upem = static["head"].unitsPerEm
    buffer = hb.Buffer()
    buffer.add_str(text)
    buffer.guess_segment_properties()
    hb.shape(hb_font, buffer, {"kern": True, "liga": True})

    glyph_set = static.getGlyphSet()
    order = static.getGlyphOrder()
    scale = size / upem
    pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    cursor = x
    for info, pos in zip(buffer.glyph_infos, buffer.glyph_positions):
        name = order[info.codepoint]
        # Flip the y axis: font units point up, SVG points down.
        transform = (scale, 0, 0, -scale, cursor + pos.x_offset * scale, y - pos.y_offset * scale)
        glyph_set[name].draw(TransformPen(pen, transform))
        cursor += pos.x_advance * scale + tracking
    return pen.getCommands(), round(cursor - tracking, 2)


result = {}
for key, line in LINES.items():
    path, right = outline(*line)
    result[key] = {"d": path, "right": right}
    print(f"{key}: {len(path)} chars, ends at x={right}")

with open("src/brand/wordmark.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)
    f.write("\n")
