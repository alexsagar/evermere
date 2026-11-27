import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  reporter: "list",
  // Resource policy (M10): one worker, files and tests strictly sequential, so at most one
  // headless browser runs against the single reused `next dev` server. Parallel runs put up to
  // 17 Chromium processes and 2.3 GB on this machine and, with software WebGL, delayed client
  // navigations by 10-30 s. Desktop, tablet and mobile cases inside each spec run in order.
  workers: 1,
  fullyParallel: false,
  use: { baseURL: `http://localhost:${PORT}`, trace: process.env.PW_TRACE ? "retain-on-failure" : "off", video: "off" },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: {
    env: { CONTENT_SOURCE: "demo" },
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}/dev/smoke`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
