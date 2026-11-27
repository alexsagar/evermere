import { defaultDeps, handleInquiry } from "@/lib/inquiry/server";

// Short ceiling: validation is instant and provider/verification calls carry their own timeouts.
export const maxDuration = 15;

export async function POST(request: Request) {
  const { status, body } = await handleInquiry(request, defaultDeps());
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
