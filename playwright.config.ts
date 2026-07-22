import { defineConfig, devices } from "@playwright/test";

// Reuse the locally running dev server if one is already on :3001; otherwise
// Playwright will start `pnpm dev`. The CI flag flips a few defaults
// (retries, parallelism, html reporter) so the same config works in both.
const PORT = Number(process.env.PORT ?? 3001);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Route compilation can briefly queue behind the responsive audit when the
  // suite exercises the development server with four workers. Keep failures
  // deterministic without weakening any individual assertion.
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
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
