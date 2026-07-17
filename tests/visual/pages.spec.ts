import { test, expect, type Page } from "@playwright/test";
import { pages } from "./pages";

/**
 * Suppress non-deterministic elements before capture:
 * - background videos (hero-video plays on loop)
 * - lazy gradient orbs / particle canvases
 * - toasts / carets
 * Wait for fonts + network idle so text metrics are stable.
 */
async function stabilize(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      video, canvas, [data-vr-hide], .animate-blob-morph,
      .animate-orb-drift, .animate-float-icon,
      .animate-pulse-glow, .animate-shimmer {
        visibility: hidden !important;
      }
    `,
  });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  // Small settle to allow layout after font load.
  await page.waitForTimeout(250);
}

for (const p of pages) {
  test(`visual: ${p.name}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(p.path, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(p.waitFor ?? "main, [data-hero], body", {
      timeout: 15_000,
    });
    await stabilize(page);

    expect(errors, `page threw runtime errors: ${errors.join(" | ")}`).toEqual([]);

    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      fullPage: true,
    });
  });
}