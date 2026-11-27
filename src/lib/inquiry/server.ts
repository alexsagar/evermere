import "server-only";
import { z } from "zod";
import { LIMITS, MAX_BODY_BYTES, validateInquiry, type InquiryErrors } from "./fields";
import { inquiryConfig, type InquiryConfig } from "./config";
import { verifyTurnstile } from "./turnstile";
import { resendMailer, type Mailer } from "./mailer";

// Shape and type checks. Generous outer bounds stop oversized values before the
// shared field rules run; the field rules give visitors their readable messages.
const payload = z.object({
  name: z.string().max(LIMITS.name * 2),
  email: z.string().max(LIMITS.email * 2),
  phone: z.string().max(LIMITS.phone * 2).default(""),
  interest: z.string().max(LIMITS.interest * 2).default(""),
  contactMethod: z.string().max(20).default(""),
  message: z.string().max(LIMITS.message + 500).default(""),
  consent: z.boolean(),
  website: z.string().max(200).default(""), // honeypot: people never see or fill it
  submissionId: z.uuid(),
  turnstileToken: z.string().max(2048).optional(),
}).strict();

export type InquiryResult =
  | { status: 200; body: { ok: true; mode: "demo" | "live" } }
  | { status: 400; body: { ok: false; error: "invalid"; fields?: InquiryErrors } }
  | { status: 403 | 413 | 415 | 429 | 502 | 503; body: { ok: false; error: string } };

export type InquiryDeps = {
  config: InquiryConfig;
  verifyBot: (token: string | undefined, ip: string) => Promise<boolean>;
  mailer: Mailer | null;
  rateLimit: (key: string) => boolean;
  seen: (id: string) => boolean;
};

const fail = <S extends 403 | 413 | 415 | 429 | 502 | 503>(status: S, error: string) => ({ status, body: { ok: false as const, error } });

/** Reads at most `limit` bytes; returns null if the body is larger. */
async function readLimited(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > limit) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

/** Same-origin browser requests only. Origin is required; Sec-Fetch-Site must agree when sent. */
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const site = request.headers.get("sec-fetch-site");
  if (!origin || !host || (site && site !== "same-origin")) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Handles one inquiry. Never logs, stores or echoes personal information.
 * Demonstration mode validates and then discards the data.
 */
export async function handleInquiry(request: Request, deps: InquiryDeps): Promise<InquiryResult> {
  if (!sameOrigin(request)) return fail(403, "forbidden");
  if (deps.config.mode === "disabled") return fail(503, "unavailable");
  const mode = deps.config.mode;
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return fail(415, "unsupported");
  const raw = await readLimited(request, MAX_BODY_BYTES).catch(() => null);
  if (raw === null) return fail(413, "too_large");

  let json: unknown;
  try { json = JSON.parse(raw); } catch { return { status: 400, body: { ok: false, error: "invalid" } }; }
  const parsed = payload.safeParse(json);
  if (!parsed.success) return { status: 400, body: { ok: false, error: "invalid" } };
  const d = parsed.data;

  const ip = clientIp(request);
  if (!deps.rateLimit(ip)) return fail(429, "rate_limited");

  const values = {
    name: d.name.trim(), email: d.email.trim(), phone: d.phone.trim(), interest: d.interest.trim(),
    contactMethod: d.contactMethod.trim(), message: d.message.trim(), consent: d.consent,
  };
  const fields = validateInquiry(values);
  if (Object.keys(fields).length) return { status: 400, body: { ok: false, error: "invalid", fields } };

  // A filled honeypot gets the ordinary answer so automated senders learn nothing.
  if (d.website) return { status: 200, body: { ok: true, mode } };
  // A repeated submission (double click, retry after a timeout) is answered, not delivered twice.
  if (deps.seen(d.submissionId)) return { status: 200, body: { ok: true, mode } };

  if (deps.config.mode === "demo") return { status: 200, body: { ok: true, mode: "demo" } };

  // Live mode: every requirement was validated by inquiryConfig; the mailer exists only then.
  const { to, from } = deps.config;
  if (!deps.mailer) return fail(503, "unavailable");
  if (!(await deps.verifyBot(d.turnstileToken, ip).catch(() => false))) return fail(403, "verification_failed");
  try {
    await deps.mailer({
      to,
      from,
      replyTo: values.email,
      subject: `Website inquiry from ${values.name}`,
      text: [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Phone: ${values.phone || "Not provided"}`,
        `Interest: ${values.interest || "Not specified"}`,
        `Preferred contact: ${values.contactMethod || "Not specified"}`,
        "",
        values.message || "(No message)",
      ].join("\n"),
    });
  } catch {
    return fail(502, "delivery_failed");
  }
  return { status: 200, body: { ok: true, mode: "live" } };
}

// ponytail: per-instance memory. Fine for local demonstration; live mode refuses to start
// until a shared (distributed) limiter replaces these, see config.ts.
function windowLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (hits.size > 5000) hits.clear();
    if (recent.length >= max) { hits.set(key, recent); return false; }
    hits.set(key, [...recent, now]);
    return true;
  };
}
function seenOnce(ttlMs: number) {
  const ids = new Map<string, number>();
  return (id: string) => {
    const now = Date.now();
    for (const [k, t] of ids) if (now - t > ttlMs) ids.delete(k);
    if (ids.has(id)) return true;
    ids.set(id, now);
    return false;
  };
}

let defaults: InquiryDeps | undefined;
export function defaultDeps(): InquiryDeps {
  if (defaults) return defaults;
  const config = inquiryConfig();
  defaults = {
    config,
    verifyBot: config.mode === "live" ? (token, ip) => verifyTurnstile(token, ip, config.turnstileSecret) : async () => true,
    mailer: config.mode === "live" ? resendMailer(config.resendKey) : null,
    // Generous in demonstration so local review and test runs share one server; live needs a distributed limiter.
    rateLimit: windowLimiter(config.mode === "demo" ? 60 : 5, 10 * 60_000),
    seen: seenOnce(30 * 60_000),
  };
  return defaults;
}
