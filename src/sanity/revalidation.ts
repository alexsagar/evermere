import { z } from "zod";

export const webhookPayload = z.object({
  _type: z.enum(["siteSettings", "navigation", "homePage", "inquirySettings", "page", "careService", "accommodation", "article", "teamMember", "faq", "gallery", "sanity.imageAsset"]),
  _id: z.string().min(1).max(200),
}).strict();

export function revalidationTags(body: unknown): string[] {
  const parsed = webhookPayload.parse(body);
  if (parsed._id.startsWith("drafts.") || parsed._id.startsWith("versions.")) return [];
  return [parsed._type === "sanity.imageAsset" ? "sanity:images" : `sanity:${parsed._type}`];
}
