# Premium container width + horizontal spacing refinement

Goal: content sits comfortably centered — never edge-to-edge — matching the Stripe / Linear / Vercel gutter feel. Structure, components, typography, colors, and functionality stay untouched.

## Target sizing

Benchmarks (measured on their marketing pages):
- Stripe: ~1080px content, 24–96px side gutter
- Linear: ~1024px content, 24–80px side gutter
- Vercel: ~1200px content, 24–96px side gutter
- Notion marketing: ~1150px content, 32–96px side gutter

Adopt a **single global rule** that matches this:

| Viewport | Side padding | Effective max content |
| --- | --- | --- |
| < 640px (mobile) | 20px | viewport − 40 |
| 640–1023px (sm/md) | 32px | viewport − 64 |
| 1024–1279px (lg) | 48px | viewport − 96 |
| 1280–1535px (xl) | 64px | 1120px |
| ≥ 1536px (2xl) | 96px | **1120px** (capped) |

Result: on a 1440px monitor the content block is 1120px with ~160px of whitespace per side. On a 1920px monitor it stays at 1120px centered — never stretched.

## Implementation

Single edit to `tailwind.config.ts` — nothing else changes.

```ts
container: {
  center: true,
  padding: {
    DEFAULT: "1.25rem",   // 20px
    sm: "2rem",           // 32px
    lg: "3rem",           // 48px
    xl: "4rem",           // 64px
    "2xl": "6rem",        // 96px
  },
  screens: {
    // Cap the container at 1120px starting at the xl breakpoint,
    // so it never stretches on wide monitors.
    xl: "1120px",
    "2xl": "1120px",
  },
},
```

This is enough on its own because every page wrapper was normalized in the previous turn to `container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12`. Those utility paddings are close to but slightly less than the new container defaults on the same breakpoints. To make the config the single source of truth (and stop utility classes from fighting the container), also do one global find/replace:

- `container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12` → `container mx-auto`

That's a mechanical sed across `src/` — no structural change, just letting the container config own the horizontal padding so every page follows the exact same rules. Header pill (`Header.tsx`) keeps its own `px-4 md:px-6` since it's a floating rounded nav bar with intentionally tighter padding, not a content container.

## Files touched

1. `tailwind.config.ts` — container padding + max-width refinement (the change above)
2. All page/layout files under `src/pages/` and `src/components/layout/Footer.tsx` — remove the redundant `px-*` utilities from `container mx-auto` wrappers so the container config governs consistently

## Explicitly out of scope

- No component, typography, color, gradient, animation, or copy changes
- No structural or layout changes inside sections (grids, cards, hero, etc. stay identical)
- No changes to non-container wrappers (`max-w-2xl`, `max-w-4xl`, inner card padding, etc.)
- Header floating nav pill keeps its current inner padding — it isn't a page container

## Verification

- Load `/`, `/programs`, `/rotations`, `/institutions`, `/contact`, `/dashboard` at 1280, 1440, 1920 CSS px:
  - Content column stays ≤ 1120px, centered
  - Side whitespace grows with viewport, never touches 0
- At 375px mobile: 20px padding on both sides, no horizontal scroll
- No visual regression inside sections — only the outer gutter changes
