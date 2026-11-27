import { expect, test, type Page } from "@playwright/test";

// Milestone 9: inquiry endpoint, failure recovery, duplicate prevention, footer.

async function fill(page: Page) {
  await page.fill("#iq-name", "Jordan Example");
  await page.fill("#iq-email", "jordan@example.com");
  await page.check("#iq-consent");
}

test("endpoint rejects cross-origin, oversized and malformed requests", async ({ request, baseURL }) => {
  const ok = { name: "A", email: "a@example.com", consent: true, submissionId: crypto.randomUUID() };
  expect((await request.post("/api/inquiry", { data: ok, headers: { origin: "https://attacker.test" } })).status()).toBe(403);
  expect((await request.post("/api/inquiry", { data: { ...ok, message: "a".repeat(9000) }, headers: { origin: baseURL! } })).status()).toBe(413);
  expect((await request.post("/api/inquiry", { data: "{bad", headers: { origin: baseURL!, "content-type": "application/json" } })).status()).toBe(400);
  const r = await request.post("/api/inquiry", { data: ok, headers: { origin: baseURL! } });
  expect(r.status()).toBe(200);
  expect(await r.json()).toEqual({ ok: true, mode: "demo" });
  expect(r.headers()["cache-control"]).toContain("no-store");
});

test("one submission per click; nothing leaves the site", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (r) => r.method() !== "GET" && !r.url().includes("__nextjs") && writes.push(r.url()));
  await page.route("/api/inquiry", async (route) => { await new Promise((r) => setTimeout(r, 600)); await route.continue(); });
  await page.goto("/contact#inquire");
  await fill(page);
  const send = page.getByRole("button", { name: "Send inquiry" });
  await send.click();
  await page.getByRole("button", { name: "Sending…" }).click({ force: true });
  await expect(page.getByRole("heading", { name: "Your inquiry is ready." })).toBeFocused();
  expect(writes.map((u) => new URL(u).pathname)).toEqual(["/api/inquiry"]);
});

test("server failure keeps answers, announces the problem and allows a retry", async ({ page }) => {
  let calls = 0;
  await page.route("/api/inquiry", (route) => (++calls === 1 ? route.fulfill({ status: 503, json: { ok: false, error: "unavailable" } }) : route.continue()));
  await page.goto("/contact#inquire");
  await fill(page);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "was not sent" });
  await expect(alert).toBeFocused();
  await expect(page.locator("#iq-name")).toHaveValue("Jordan Example");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".iq-sent[role=status]")).toBeVisible();
});

test("server field errors are shown with the summary", async ({ page }) => {
  await page.route("/api/inquiry", (route) => route.fulfill({ status: 400, json: { ok: false, error: "invalid", fields: { email: "Please check this email address. It should look like name@example.com." } } }));
  await page.goto("/contact#inquire");
  await fill(page);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator(".iq-summary")).toBeFocused();
  await expect(page.locator("#iq-email")).toHaveAttribute("aria-invalid", "true");
});

test("keyboard-only inquiry at a short mobile height with reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: "reduce" });
  try {
    const page = await ctx.newPage();
    await page.goto("/contact#inquire");
    await page.locator("#iq-name").focus();
    await page.keyboard.type("Jordan Example");
    await page.keyboard.press("Tab");
    await page.keyboard.type("jordan@example.com");
    await page.locator("#iq-consent").focus();
    await page.keyboard.press("Space");
    await page.locator("#iq-consent").press("Enter");
    await expect(page.getByRole("heading", { name: "Your inquiry is ready." })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await ctx.close();
  }
});

test("footer: links resolve, contact and disclosure present, readable without motion", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Arrange a visit" })).toHaveAttribute("href", "/contact#inquire");
  await expect(footer.getByText(/Private demonstration/)).toBeVisible();
  await expect(footer.locator('a[href^="tel:"]')).toBeVisible();
  const hrefs = await footer.locator("a[href^='/']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")!.split("#")[0]!))]);
  expect(hrefs.length).toBeGreaterThan(10);
  for (const h of hrefs) expect((await request.get(h)).status(), h).toBe(200);
  for (const w of [1440, 768, 320]) {
    await page.setViewportSize({ width: w, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${w}px`).toBe(true);
    await expect(footer.locator(".ft-line")).toHaveCSS("opacity", "1");
  }
});

test("footer animation leaves the footer fully visible", async ({ page }) => {
  await page.goto("/about");
  await page.locator("footer .ft-legal").scrollIntoViewIfNeeded();
  await expect(page.locator("footer .ft-line")).toHaveCSS("opacity", "1", { timeout: 5000 });
  await expect(page.locator("footer [data-ft-mark]")).toHaveCSS("clip-path", /inset\(0(%|px)/, { timeout: 5000 });
});
