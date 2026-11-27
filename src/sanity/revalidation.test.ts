import { afterEach, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { revalidationTags } from "./revalidation";

const mocks = vi.hoisted(() => ({ parseBody: vi.fn(), revalidateTag: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("next-sanity/webhook", () => ({ parseBody: mocks.parseBody }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag, revalidatePath: mocks.revalidatePath }));
import { POST } from "@/app/api/sanity/revalidate/route";
const request = () => new NextRequest("http://localhost/api/sanity/revalidate", { method: "POST", headers: { "sanity-webhook-signature": "test-signature" }, body: "{}" });
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
it("fails closed without a configured secret", async () => {
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
  expect((await POST(request())).status).toBe(503);
  expect(mocks.parseBody).not.toHaveBeenCalled();
});
it("rejects invalid signatures without invalidating anything", async () => {
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "x".repeat(32));
  mocks.parseBody.mockResolvedValue({ isValidSignature: false, body: { _id: "a", _type: "article" } });
  expect((await POST(request())).status).toBe(401);
  expect(mocks.revalidateTag).not.toHaveBeenCalled();
});
it("invalidates article data and both listing and dynamic article routes", async () => {
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "x".repeat(32));
  mocks.parseBody.mockResolvedValue({ isValidSignature: true, body: { _id: "article.1", _type: "article" } });
  const result = await POST(request());
  expect(result.status).toBe(204);
  expect(await result.text()).toBe("");
  expect(mocks.revalidateTag).toHaveBeenCalledWith("sanity:article", { expire: 0 });
  expect(mocks.revalidatePath).toHaveBeenCalledWith("/resources/[slug]", "page");
});
it("rejects arbitrary tags and ignores drafts and releases", () => {
  expect(() => revalidationTags({ _id: "a", _type: "article", tags: ["everything"] })).toThrow();
  expect(revalidationTags({ _id: "drafts.a", _type: "article" })).toEqual([]);
  expect(revalidationTags({ _id: "versions.release.a", _type: "article" })).toEqual([]);
  expect(revalidationTags({ _id: "image-a", _type: "sanity.imageAsset" })).toEqual(["sanity:images"]);
});
it("verifies real signed bytes locally and rejects a tampered payload", async () => {
  const { parseBody } = await vi.importActual<typeof import("next-sanity/webhook")>("next-sanity/webhook");
  mocks.parseBody.mockImplementation((req, secret) => parseBody(req, secret, false));
  const secret = "local-test-secret-".repeat(3);
  vi.stubEnv("SANITY_REVALIDATE_SECRET", secret);
  const body = JSON.stringify({ _id: "article.1", _type: "article" });
  const timestamp = Date.now();
  const signature = `t=${timestamp},v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("base64url")}`;
  const signed = (payload: string) => new NextRequest("http://localhost/api/sanity/revalidate", {
    method: "POST", headers: { "sanity-webhook-signature": signature }, body: payload,
  });
  expect((await POST(signed(body))).status).toBe(204);
  mocks.revalidateTag.mockClear();
  expect((await POST(signed(body.replace("article.1", "article.2")))).status).toBe(401);
  expect(mocks.revalidateTag).not.toHaveBeenCalled();
});
