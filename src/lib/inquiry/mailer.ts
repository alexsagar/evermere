import "server-only";

export type MailMessage = { to: string; from: string; replyTo: string; subject: string; text: string };
/** Resolves only when the provider confirms acceptance; throws otherwise. */
export type Mailer = (message: MailMessage) => Promise<{ id: string }>;

/**
 * Resend over its HTTP API (no SDK). Plain text only, so visitor input is never
 * interpreted as HTML. Header values are single-line by validation and are sent as
 * JSON fields, never concatenated into raw headers. Used only in validated live mode.
 */
export function resendMailer(apiKey: string, fetcher: typeof fetch = fetch, timeoutMs = 8000): Mailer {
  return async (m) => {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`Email provider rejected the message (${response.status})`);
    const data = (await response.json().catch(() => null)) as { id?: unknown } | null;
    if (typeof data?.id !== "string") throw new Error("Email provider did not confirm acceptance");
    return { id: data.id };
  };
}
