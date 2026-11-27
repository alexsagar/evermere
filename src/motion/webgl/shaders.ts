// GLSL for photographic planes. All sampling goes through `cover()`, which crops
// like CSS object-fit: cover around the photo's curated focal point, so images
// are never stretched whatever the viewport aspect.

export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const cover = /* glsl */ `
// uv in [0,1]; plane and image sizes in px; focal from the top left (0..1).
vec2 cover(vec2 uv, vec2 plane, vec2 image, vec2 focal, float zoom) {
  float rp = plane.x / plane.y;
  float ri = image.x / image.y;
  vec2 s = (rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0)) / zoom;
  vec2 f = vec2(focal.x, 1.0 - focal.y);
  vec2 o = clamp(f - s * 0.5, vec2(0.0), vec2(1.0) - s);
  return o + uv * s;
}
`;

const arch = /* glsl */ `
// Signed distance to the Threshold arch: a rectangle with a semicircular head,
// standing on the bottom edge, centered. p is in aspect-corrected units.
float archSdf(vec2 p, float halfWidth, float shoulder) {
  vec2 q = vec2(abs(p.x), p.y);
  if (q.y < shoulder) return max(q.x - halfWidth, -q.y);
  return length(q - vec2(0.0, shoulder)) - halfWidth;
}
`;

/**
 * Transition between two photographs. uMode: 0 directional displacement,
 * 1 Threshold arch opening, 2 dolly (scale-through). When uHasFrom is 0 the
 * outgoing image is the Midnight brand color (used by the opening).
 */
export const transitionFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromSize;
uniform vec2 uToSize;
uniform vec2 uFromFocal;
uniform vec2 uToFocal;
uniform vec2 uRes;
uniform float uProgress;
uniform int uMode;
uniform float uHasFrom;
const vec3 MIDNIGHT = vec3(0.0094, 0.0176, 0.0467); // #18243D in linear space

${cover}
${arch}

vec4 from(vec2 uv, float zoom) {
  if (uHasFrom < 0.5) return vec4(MIDNIGHT, 1.0);
  return texture2D(uFrom, cover(uv, uRes, uFromSize, uFromFocal, zoom));
}
vec4 to(vec2 uv, float zoom) { return texture2D(uTo, cover(uv, uRes, uToSize, uToFocal, zoom)); }

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  vec2 uv = vUv;
  vec4 col;

  if (uMode == 0) {
    // A soft wipe travels left to right; each image slides a little along the
    // direction of travel, more near the wipe front. Max shift 6% of the frame.
    float front = mix(-0.15, 1.15, p);
    float edge = smoothstep(front - 0.09, front + 0.09, uv.x + 0.06 * sin(uv.y * 3.1416));
    float push = 0.06 * smoothstep(0.25, 0.0, abs(uv.x - front));
    vec4 a = from(uv - vec2(push * p, 0.0), 1.0 + 0.04 * p);
    vec4 b = to(uv + vec2(push * (1.0 - p), 0.0), 1.04 - 0.04 * p);
    col = mix(b, a, edge);
  } else if (uMode == 1) {
    // The arch grows from a doorway at the bottom center until it clears the frame.
    float aspect = uRes.x / uRes.y;
    vec2 q = vec2((uv.x - 0.5) * aspect, uv.y);
    float e = p * p * (3.0 - 2.0 * p);
    float halfWidth = mix(0.0, aspect * 0.5 + 0.9, e);
    float d = archSdf(q, halfWidth, halfWidth * 1.15);
    float aa = 1.5 / uRes.y;
    float inside = 1.0 - smoothstep(-aa, aa, d);
    col = mix(from(uv, 1.0 + 0.05 * e), to(uv, 1.18 - 0.18 * e), inside);
  } else {
    // Dolly: the outgoing photograph moves toward the viewer and opens from
    // the focal point outward; the incoming one settles from slightly forward.
    float e = p * p * (3.0 - 2.0 * p);
    vec2 c = vec2(uToFocal.x, 1.0 - uToFocal.y);
    float r = distance(vec2((uv.x - c.x) * uRes.x / uRes.y, uv.y - c.y), vec2(0.0));
    float open = smoothstep(e * 1.6 - 0.25, e * 1.6, r);
    vec4 a = from(uv, 1.0 + 0.35 * e);
    vec4 b = to(uv, 1.12 - 0.12 * e);
    col = mix(b, a, open * (1.0 - smoothstep(0.85, 1.0, e)));
  }
  // Textures are decoded from sRGB on sampling; encode back for the canvas.
  gl_FragColor = col;
  #include <colorspace_fragment>
}
`;
