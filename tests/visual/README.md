# Visual regression tests

These tests capture full-page screenshots of every public page and compare
them against committed baselines under `tests/visual/__screenshots__/`.
They catch unintended design-system changes (colors, spacing, radius,
shadows, typography, component styling) across the whole app.

## Run

```bash
bunx playwright test           # compare against baselines
bunx playwright test --update-snapshots   # accept current UI as new baseline
bunx playwright show-report    # open the HTML diff report
```

The suite expects the Vite dev server at `http://localhost:8080`.
Set `PLAYWRIGHT_BASE_URL` to point at a preview or production URL.

## What's covered

- Public marketing pages (Landing, Programs, Rotations, Institutions, About,
  Contact, Apply, Auth, Terms, Privacy).
- Design-system primitives page (`/__ds`) — if you add one, list it in
  `pages.ts` and it'll be captured automatically.
- Each page is captured at desktop (1280×900) and mobile (Pixel 7).

Authenticated (dashboard, admin, qbank) pages are intentionally excluded
because their content is data-driven and not stable for pixel diffing.

## Adding a page

Edit `tests/visual/pages.ts` and add a route. The test file iterates
automatically — no new spec required.

## Reducing flakiness

- Animations are disabled via Playwright config.
- Fonts are awaited via `document.fonts.ready` before capture.
- Videos and lazy-loaded orbs are hidden with the injected `.vr-hide` CSS
  before screenshotting.
- Small antialiasing diffs are tolerated (`maxDiffPixelRatio: 0.02`).