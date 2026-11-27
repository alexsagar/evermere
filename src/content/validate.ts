/** Fail closed in CMS mode. Never substitute demonstration copy for remote failures. */
export function requireContent<T>(value: T | null | undefined, name: string, demo: T, allowEmpty = false): T {
  if (value == null || (!allowEmpty && Array.isArray(value) && !value.length)) throw new Error(`Sanity content missing: ${name}`);
  const example = Array.isArray(demo) ? demo[0] : demo;
  const records = Array.isArray(value) ? value : [value];
  if (!example || typeof example !== "object") throw new Error(`Invalid content contract: ${name}`);
  for (const record of records) {
    if (!record || typeof record !== "object") throw new Error(`Invalid Sanity response: ${name}`);
    if (name === "siteSettings" && ["logo", "logoDark", "favicon"].some((key) => !record[key])) {
      throw new Error("Sanity brand assets missing: siteSettings. Threshold fallback is available only in explicit demo mode.");
    }
    for (const [key, expected] of Object.entries(example)) {
      // These projected fields are nullable by schema (e.g. legal pages have no hero image).
      if (["image", "cta", "related"].includes(key) && record[key] == null) continue;
      if (expected != null && !key.startsWith("_") && (record[key] == null || typeof record[key] !== typeof expected)) {
        throw new Error(`Invalid Sanity field: ${name}.${key}`);
      }
    }
  }
  return value;
}
