import { defineConfig, devices } from "@playwright/test";

// Reuse a locally running server on :3001; otherwise Playwright builds and
// starts the production app. Parallel route compilation in Next 15 development
// mode can corrupt its webpack cache during the responsive suite.
// The CI flag flips a few defaults
// (retries, parallelism, html reporter) so the same config works in both.
const PORT = Number(process.env.PORT ?? 3001);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Keep enough room for slower route and screenshot checks.
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Only Chromium is installed locally; use the Desktop Chrome base and
  // override the viewport to emulate the form factor. We keep iPhone/iPad
  // device descriptors *off* so we don't pull in WebKit.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "tablet",
      testIgnore: /audit\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 820, height: 1180 },
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: "mobile",
      testIgnore: /audit\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: false,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
