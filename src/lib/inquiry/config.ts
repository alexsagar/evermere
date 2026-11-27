import "server-only";
import { z } from "zod";

export type InquiryConfig =
  | { mode: "demo" }
  | { mode: "disabled"; reason: string }
  | { mode: "live"; resendKey: string; from: string; to: string; turnstileSecret: string };

const address = z.email().max(254);
const live = z.object({
  RESEND_API_KEY: z.string().regex(/^re_[A-Za-z0-9_]{16,}$/, "RESEND_API_KEY is missing or malformed"),
  INQUIRY_FROM_EMAIL: address,
  INQUIRY_TO_EMAIL: address,
  INQUIRY_SENDER_DOMAIN: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "INQUIRY_SENDER_DOMAIN must be the approved, verified sending domain"),
  TURNSTILE_SECRET_KEY: z.string().min(20, "TURNSTILE_SECRET_KEY is missing"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(10, "NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing"),
  INQUIRY_RATE_LIMIT: z.literal("distributed", "A shared rate limiter is required for live delivery"),
}).superRefine((v, ctx) => {
  if (!v.INQUIRY_FROM_EMAIL.endsWith(`@${v.INQUIRY_SENDER_DOMAIN}`)) ctx.addIssue({ code: "custom", message: "INQUIRY_FROM_EMAIL must use the approved sender domain" });
  if (/@example\.(com|org|net)$/.test(v.INQUIRY_TO_EMAIL)) ctx.addIssue({ code: "custom", message: "INQUIRY_TO_EMAIL must be the client's approved recipient" });
});

/**
 * Inquiry mode. Demonstration is the default and the only active mode. Live delivery
 * needs INQUIRY_MODE=live plus every credential and control below; anything missing,
 * malformed or unknown disables the endpoint (fail closed) instead of falling back.
 */
export function inquiryConfig(source: Record<string, string | undefined> = process.env): InquiryConfig {
  const mode = source.INQUIRY_MODE || "demo";
  if (mode === "demo") return { mode: "demo" };
  if (mode !== "live") return { mode: "disabled", reason: "INQUIRY_MODE must be demo or live" };
  const parsed = live.safeParse(source);
  if (!parsed.success) return { mode: "disabled", reason: parsed.error.issues.map((i) => i.message).join("; ") };
  // ponytail: the distributed limiter itself is not built. Until it exists, live mode
  // cannot pass this point even with every credential configured.
  return { mode: "disabled", reason: "Distributed rate limiting is not implemented yet" };
}
