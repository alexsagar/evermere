// Motion and focus sweep (production build). For each route, with and without reduced motion:
// after scrolling through, any visible-text element left at opacity < 0.1 or visibility hidden
// is reported (content hidden by an animation). Then Shift+Tab from the end of the page and
// Tab from the top: any focused element covered by the fixed header is reported (WCAG 2.4.11).
// Usage: node scripts/motion-focus-sweep.mjs [baseURL]
import { chromium } from "@playwright/test";

const B = process.argv[2] ?? "http://127.0.0.1:3000";
const ROUTES = ["/", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/care-services", "/about", "/our-team", "/gallery", "/contact", "/resources", "/faq", "/privacy", "/accessibility", "/resources/choosing-a-community"];
const browser = await chromium.launch();
const report = [];
try {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 650 }, reducedMotion });
    await ctx.addInitScript(() => sessionStorage.setItem("evermere:opening-seen", "1"));
    const page = await ctx.newPage();
    for (const path of ROUTES) {
      await page.goto(B + path, { waitUntil: "networkidle" });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.5) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
      await page.waitForTimeout(2500);
      const hidden = await page.evaluate(() => [...document.querySelectorAll("main *, footer *")].filter((el) => {
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
        if (el.closest("[hidden], dialog:not([open]), [aria-hidden='true'], .sr-only, .skip-link, details:not([open]) > :not(summary), [inert]")) return false;
        let e = el;
        while (e && e !== document.body) { const s = getComputedStyle(e); if (Number(s.opacity) < 0.1 || s.visibility === "hidden") return true; if (s.display === "none") return false; e = e.parentElement; }
        return false;
      }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}: ${el.textContent.trim().slice(0, 40)}`));
      // Focus not obscured: reverse then forward tabbing, checked against the header's bottom edge.
      const obscured = new Set();
      for (const [key, start] of [["Shift+Tab", "end"], ["Tab", "start"]]) {
        await page.evaluate((s) => { (s === "end" ? document.body : document.body).focus(); scrollTo(0, s === "end" ? document.body.scrollHeight : 0); }, start);
        await page.waitForTimeout(300);
        for (let i = 0; i < 60; i++) {
          await page.keyboard.press(key);
          const r = await page.evaluate(() => {
            const a = document.activeElement; const h = document.querySelector(".site-header");
            if (!a || a === document.body || !h || h.contains(a) || a.classList.contains("skip-link") || a.closest("dialog, [role=dialog]")) return null;
            const hb = h.getBoundingClientRect(); const ab = a.getBoundingClientRect();
            const headerShown = getComputedStyle(h).visibility !== "hidden" && hb.bottom > 0;
            return headerShown && ab.bottom <= hb.bottom + 1 && ab.height > 0 ? `${a.tagName.toLowerCase()}:${(a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 30)}` : null;
          });
          if (r) obscured.add(r);
        }
      }
      report.push({ reducedMotion, path, hidden, obscured: [...obscured] });
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
for (const r of report) if (r.hidden.length || r.obscured.length) console.log(r.reducedMotion, r.path, JSON.stringify(r.hidden), JSON.stringify(r.obscured));
console.log("checked", report.length, "route/motion combinations");
