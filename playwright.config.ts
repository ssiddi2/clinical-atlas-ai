import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression tests for the design system.
 * Run: `bunx playwright test` (compares against baselines)
 * Update baselines: `bunx playwright test --update-snapshots`
 *
 * Requires the Vite dev server on http://localhost:8080.
 * In the Lovable sandbox the dev server is already running, so
 * `webServer` is only used outside the sandbox (reuseExistingServer).
 */
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
  },
  // Deterministic screenshots: fixed viewport, disable animations.
  expect: {
    toHaveScreenshot: {
      // Small pixel tolerance for antialiasing / font hinting jitter.
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});