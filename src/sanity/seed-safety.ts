import type { MigrationDocument } from "./migration";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const fields = Object.entries(value)
      .filter(([key]) => !["_rev", "_createdAt", "_updatedAt", "_system"].includes(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`);
    return "{" + fields.join(",") + "}";
  }
  return JSON.stringify(value);
}

/** Resume only identical migration documents. Any client changes or unrelated data abort the whole seed. */
export function assertSeedSafe(existing: MigrationDocument[], planned: MigrationDocument[], assetIds: string[]) {
  const byId = new Map(planned.map((d) => [d._id, d]));
  for (const document of existing) {
    if (document._type === "sanity.imageAsset" && assetIds.includes(document._id)) continue;
    const expected = byId.get(document._id);
    if (!expected || canonical(document) !== canonical(expected)) throw new Error("Dataset contains content outside this unchanged seed. Refusing all writes.");
  }
}
