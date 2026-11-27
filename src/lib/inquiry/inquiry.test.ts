import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { handleInquiry } = await import("./server");
const { inquiryConfig } = await import("./config");
const { resendMailer } = await import("./mailer");
const { verifyTurnstile } = await import("./turnstile");
const { validateInquiry, MAX_BODY_BYTES } = await import("./fields");
type Deps = import("./server").InquiryDeps;

const valid = () => ({
  name: "Jordan Avery", email: "jordan@example.com", phone: "(206) 555-0199", interest: "Arranging a visit",
  contactMethod: "Email", message: "We would like to visit next week.", consent: true, website: "", submissionId: crypto.randomUUID(),
});

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://127.0.0.1:3000/api/inquiry", {
    method: "POST",
    headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000", "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function deps(over: Partial<Deps> = {}): Deps {
  return { config: { mode: "demo" }, verifyBot: async () => true, mailer: null, rateLimit: () => true, seen: () => false, ...over };
}
const liveConfig = { mode: "live" as const, resendKey: "re_test", from: "inquiries@client.test", to: "team@client.test", turnstileSecret: "secret" };

describe("inquiry endpoint", () => {
  it("demonstration mode accepts a valid inquiry and sends nothing", async () => {
    const mailer = vi.fn();
    const r = await handleInquiry(req(valid()), deps({ mailer }));
    expect(r).toEqual({ status: 200, body: { ok: true, mode: "demo" } });
    expect(mailer).not.toHaveBeenCalled();
  });

  it("returns field messages without echoing submitted values", async () => {
    const r = await handleInquiry(req({ ...valid(), name: "", email: "not-an-email", consent: false }), deps());
    expect(r.status).toBe(400);
    expect(Object.keys((r.body as { fields: object }).fields).sort()).toEqual(["consent", "email", "name"]);
    expect(JSON.stringify(r.body)).not.toContain("not-an-email");
  });

  it("rejects cross-origin, missing origin, wrong content type, malformed JSON and unknown fields", async () => {
    expect((await handleInquiry(req(valid(), { origin: "https://attacker.test" }), deps())).status).toBe(403);
    expect((await handleInquiry(req(valid(), { "sec-fetch-site": "cross-site" }), deps())).status).toBe(403);
    const noOrigin = req(valid()); noOrigin.headers.delete("origin");
    expect((await handleInquiry(noOrigin, deps())).status).toBe(403);
    expect((await handleInquiry(req(valid(), { "content-type": "text/plain" }), deps())).status).toBe(415);
    expect((await handleInquiry(req("{not json"), deps())).status).toBe(400);
    expect((await handleInquiry(req({ ...valid(), diagnosis: "x" }), deps())).status).toBe(400);
    expect((await handleInquiry(req({ ...valid(), submissionId: "1" }), deps())).status).toBe(400);
  });

  it("refuses bodies over the size limit, declared or streamed", async () => {
    const big = { ...valid(), message: "a".repeat(MAX_BODY_BYTES) };
    expect((await handleInquiry(req(big), deps())).status).toBe(413);
    const chunked = req(big); chunked.headers.delete("content-length");
    expect((await handleInquiry(chunked, deps())).status).toBe(413);
  });

  it("rejects header injection and control characters", async () => {
    for (const bad of [{ name: "Jordan\r\nBcc: x@example.com" }, { email: "a@example.com\nBcc: b@example.com" }, { message: "hi\u0000" }]) {
      const r = await handleInquiry(req({ ...valid(), ...bad }), deps());
      expect(r.status).toBe(400);
    }
  });

  it("answers honeypot and duplicate submissions without delivering", async () => {
    const mailer = vi.fn(async () => ({ id: "x" }));
    const live = deps({ config: liveConfig, mailer });
    expect((await handleInquiry(req({ ...valid(), website: "spam.example" }), live)).status).toBe(200);
    expect((await handleInquiry(req(valid()), { ...live, seen: () => true })).status).toBe(200);
    expect(mailer).not.toHaveBeenCalled();
  });

  it("rate limits", async () => {
    expect((await handleInquiry(req(valid()), deps({ rateLimit: () => false }))).status).toBe(429);
  });

  it("disabled mode fails closed", async () => {
    expect((await handleInquiry(req(valid()), deps({ config: { mode: "disabled", reason: "x" } }))).status).toBe(503);
  });

  it("live mode requires bot verification and reports provider failure honestly", async () => {
    const failing = vi.fn(async () => { throw new Error("down"); });
    expect((await handleInquiry(req(valid()), deps({ config: liveConfig, mailer: failing, verifyBot: async () => false }))).status).toBe(403);
    expect(failing).not.toHaveBeenCalled();
    expect((await handleInquiry(req(valid()), deps({ config: liveConfig, mailer: failing }))).status).toBe(502);
    const ok = vi.fn<(m: { to: string; replyTo: string; subject: string }) => Promise<{ id: string }>>(async () => ({ id: "accepted" }));
    expect(await handleInquiry(req(valid()), deps({ config: liveConfig, mailer: ok }))).toEqual({ status: 200, body: { ok: true, mode: "live" } });
    expect(ok.mock.calls[0]![0]).toMatchObject({ to: "team@client.test", replyTo: "jordan@example.com", subject: "Website inquiry from Jordan Avery" });
  });
});

describe("inquiry configuration", () => {
  const complete = {
    INQUIRY_MODE: "live", RESEND_API_KEY: "re_abcdefghijklmnop1234", INQUIRY_SENDER_DOMAIN: "client.test",
    INQUIRY_FROM_EMAIL: "inquiries@client.test", INQUIRY_TO_EMAIL: "team@client.test",
    TURNSTILE_SECRET_KEY: "0x0000000000000000000000000000000AA", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA", INQUIRY_RATE_LIMIT: "distributed",
  };
  it("defaults to demonstration", () => expect(inquiryConfig({})).toEqual({ mode: "demo" }));
  it("disables unknown modes and incomplete live configuration", () => {
    expect(inquiryConfig({ INQUIRY_MODE: "production" }).mode).toBe("disabled");
    expect(inquiryConfig({ INQUIRY_MODE: "live" }).mode).toBe("disabled");
    expect(inquiryConfig({ ...complete, INQUIRY_TO_EMAIL: "x@example.com" }).mode).toBe("disabled");
    expect(inquiryConfig({ ...complete, INQUIRY_FROM_EMAIL: "x@other.test" }).mode).toBe("disabled");
  });
  it("keeps live delivery off until a distributed limiter exists, even when complete", () => {
    const c = inquiryConfig(complete);
    expect(c.mode).toBe("disabled");
    expect(c.mode === "disabled" && c.reason).toMatch(/Distributed rate limiting/);
  });
});

describe("providers (mocked)", () => {
  const msg = { to: "t@client.test", from: "f@client.test", replyTo: "r@example.com", subject: "s", text: "t" };
  it("mailer succeeds only on confirmed acceptance", async () => {
    await expect(resendMailer("re_x", (async () => Response.json({ id: "1" })) as typeof fetch)(msg)).resolves.toEqual({ id: "1" });
    await expect(resendMailer("re_x", (async () => Response.json({}, { status: 500 })) as typeof fetch)(msg)).rejects.toThrow();
    await expect(resendMailer("re_x", (async () => Response.json({})) as typeof fetch)(msg)).rejects.toThrow();
  });
  it("turnstile fails closed", async () => {
    const yes = (async () => Response.json({ success: true })) as typeof fetch;
    expect(await verifyTurnstile("tok", "1.2.3.4", "s", yes)).toBe(true);
    expect(await verifyTurnstile(undefined, "1.2.3.4", "s", yes)).toBe(false);
    expect(await verifyTurnstile("tok", "1.2.3.4", "s", (async () => Response.json({ success: false })) as typeof fetch)).toBe(false);
    expect(await verifyTurnstile("tok", "1.2.3.4", "s", (async () => { throw new Error("timeout"); }) as typeof fetch)).toBe(false);
  });
});

describe("shared field rules", () => {
  const base = { name: "A", email: "a@example.com", phone: "", interest: "", contactMethod: "", message: "", consent: true };
  it("keeps optional fields optional", () => expect(validateInquiry(base)).toEqual({}));
  it("needs a phone number when phone is the preferred method", () => expect(validateInquiry({ ...base, contactMethod: "Phone" }).phone).toBeTruthy());
  it("checks interest against the published options when given", () => expect(validateInquiry({ ...base, interest: "Other" }, ["Visit"]).interest).toBeTruthy());
});
