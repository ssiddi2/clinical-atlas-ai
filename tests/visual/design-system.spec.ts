import { test, expect } from "@playwright/test";

/**
 * Design-system primitives — snapshots individual tokens/components so a
 * regression pinpoints exactly which primitive drifted (not just "landing
 * page changed"). Renders a synthetic swatch page at runtime so it doesn't
 * require any new route in the app.
 */
const SWATCH_HTML = /* html */ `
<!doctype html><html><head>
  <link rel="stylesheet" href="/src/index.css" />
  <style>
    body { margin:0; font-family: Inter, system-ui, sans-serif; padding:32px; background:hsl(var(--background)); color:hsl(var(--foreground)); }
    .row { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px; align-items:center; }
    .swatch { width:120px; height:64px; border-radius:12px; display:flex; align-items:flex-end; padding:6px 8px; font-size:11px; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.4); }
    h2 { font-size:14px; letter-spacing:.02em; text-transform:uppercase; color:var(--softer); margin:24px 0 12px; }
  </style>
</head><body>
  <h2>Brand palette</h2>
  <div class="row" data-testid="palette">
    <div class="swatch" style="background:var(--brand)">brand</div>
    <div class="swatch" style="background:var(--brand-2)">brand-2</div>
    <div class="swatch" style="background:var(--brand-3)">brand-3</div>
    <div class="swatch" style="background:var(--brand-4)">brand-4</div>
    <div class="swatch" style="background:var(--ink)">ink</div>
    <div class="swatch" style="background:var(--surface);color:#0B0B0C;text-shadow:none">surface</div>
    <div class="swatch" style="background:var(--verified)">verified</div>
  </div>

  <h2>Buttons</h2>
  <div class="row" data-testid="buttons">
    <button class="btn-brand rounded-full px-5 py-2.5 text-sm font-semibold">Primary CTA</button>
    <span class="chip">Neutral chip</span>
    <span class="chip chip-brand">Brand chip</span>
    <span class="chip chip-dot">Verified</span>
  </div>

  <h2>Cards</h2>
  <div class="row" data-testid="cards">
    <div class="lm-card" style="width:260px">
      <div class="eyebrow">Eyebrow</div>
      <h3 style="margin:6px 0 4px">Default card</h3>
      <p class="text-soft" style="margin:0">Standard 20px radius, subtle inset highlight, soft shadow.</p>
    </div>
    <div class="lm-card-lg" style="width:260px">
      <div class="eyebrow">Featured</div>
      <h3 style="margin:6px 0 4px">Large card</h3>
      <p class="text-soft" style="margin:0">28px radius, taller shadow, brand hover lift.</p>
    </div>
    <div class="glass" style="width:260px;padding:20px;border-radius:20px">
      <h3 style="margin:0 0 4px">Glass</h3>
      <p class="text-soft" style="margin:0">Frosted white over surface.</p>
    </div>
  </div>

  <h2>CTA surface</h2>
  <div class="cta-surface" data-testid="cta" style="padding:32px;border-radius:28px;max-width:640px">
    <div class="eyebrow" style="color:rgba(255,255,255,.7)">Ready</div>
    <h2 style="color:#fff;margin:8px 0 4px">Premium destination block</h2>
    <p style="margin:0;color:rgba(255,255,255,.85)">Radial glow + dot pattern + brand gradient.</p>
  </div>

  <h2>Typography</h2>
  <div data-testid="type">
    <h1 style="margin:0 0 8px">Heading one — 4rem display</h1>
    <h2 style="margin:0 0 8px">Heading two — section</h2>
    <h3 style="margin:0 0 8px">Heading three — subsection</h3>
    <p class="text-soft" style="max-width:560px">Body text uses Inter with cv11/ss01 stylistic sets. Slate 700 for soft, slate 500 for softer secondary copy.</p>
    <p><span class="text-gradient" style="font-weight:600">Gradient text</span> &middot; <a class="text-brand-2" href="#">Brand link</a></p>
  </div>
</body></html>`;

test("visual: design-system primitives", async ({ page }, testInfo) => {
  await page.setContent(SWATCH_HTML, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(200);

  await expect(page.locator('[data-testid="palette"]')).toHaveScreenshot("ds-palette.png");
  await expect(page.locator('[data-testid="buttons"]')).toHaveScreenshot("ds-buttons.png");
  await expect(page.locator('[data-testid="cards"]')).toHaveScreenshot("ds-cards.png");
  await expect(page.locator('[data-testid="cta"]')).toHaveScreenshot("ds-cta.png");
  await expect(page.locator('[data-testid="type"]')).toHaveScreenshot("ds-type.png");
});