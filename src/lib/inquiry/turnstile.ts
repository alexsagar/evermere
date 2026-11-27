import "server-only";

/** Server-side Cloudflare Turnstile check. Any missing token, error or timeout counts as a failure. */
export async function verifyTurnstile(token: string | undefined, ip: string, secret: string, fetcher: typeof fetch = fetch, timeoutMs = 5000) {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return false;
    const data = (await response.json()) as { success?: unknown };
    return data.success === true;
  } catch {
    return false;
  }
}
