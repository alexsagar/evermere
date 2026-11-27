import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { revalidationTags } from "@/sanity/revalidation";

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || secret.length < 32) return new Response(null, { status: 503 });
  if (!request.headers.get("sanity-webhook-signature")) return new Response(null, { status: 401 });
  try {
    const { isValidSignature, body } = await parseBody(request, secret);
    if (!isValidSignature) return new Response(null, { status: 401 });
    let tags: string[];
    try { tags = revalidationTags(body); }
    catch { return new Response(null, { status: 400 }); }
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    if (tags.includes("sanity:article")) {
      revalidatePath("/resources");
      revalidatePath("/resources/[slug]", "page");
    }
    return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 400 }); }
}
