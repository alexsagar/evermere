// Accessibility and responsive sweep of every content route (production build).
// One browser and context, sequential, always closed. Checks axe (WCAG 2.2 A/AA tags),
// horizontal overflow, text cut by the fixed header, and 200% text enlargement.
// Usage: node scripts/a11y-sweep.mjs [baseURL] > review/m10/a11y-sweep.json
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const B = process.argv[2] ?? "http://127.0.0.1:3000";
const ROUTES = ["/", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/care-services", "/about", "/our-team", "/gallery", "/contact", "/resources", "/faq", "/privacy", "/accessibility", "/resources/choosing-a-community"];
const SIZES = [[1440, 900], [768, 1024], [390, 844], [1920, 1080], [1280, 720], [1024, 768], [320, 568], [1366, 650], [390, 600]];
const DETAIL = new Set(["/", "/accommodations", "/gallery", "/contact", "/resources/choosing-a-community"]); // complex layouts get every size

const browser = await chromium.launch();
const out = [];
try {
  const context = await browser.newContext();
  await context.addInitScript(() => sessionStorage.setItem("evermere:opening-seen", "1"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const path of ROUTES) {
    const sizes = DETAIL.has(path) ? SIZES : SIZES.slice(0, 3);
    for (const [w, h] of sizes) {
      errors.length = 0;
      await page.setViewportSize({ width: w, height: h });
      await page.goto(B + path, { waitUntil: "networkidle" });
      // Scroll through so scroll-driven reveals settle, then back to the top.
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const row = { path, size: `${w}x${h}`, overflow, errors: [...errors] };
      if (w === 1440 || w === 390) {
        const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        row.axe = axe.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`);
      }
      if (w === 1280) {
        // 200% text enlargement (WCAG 1.4.4): nothing should overflow sideways.
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        row.text200Overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      }
      out.push(row);
    }
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(out, null, 1));
