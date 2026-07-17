# Fix visual polish issues on Landing + Institutions

Scope: styling only. No content, copy, IA, or functionality changes.

## 1. Landing hero — contrast

Hero currently layers a white radial wash (55% → 22%) over the video, then paints title/subtitle in `text-white/90` and `text-white/45`. On the near-white wash the white text nearly disappears — that's the "bad contrast" the user sees.

Fix in `src/pages/Landing.tsx` hero (both mobile + desktop branches):
- Headline line 1: `text-white/90` → `text-ink` (near-black).
- Headline line 2: keep `text-gradient-livemed` (already high contrast on white).
- Subtitle: `text-white/45` → `text-soft`.
- "Enrolling" pill: swap `glass-card-hover` + `text-white/70` for `chip chip-brand` so it reads on the light wash.
- Keep the video + wash, but tighten the wash to `hsl(0 0% 100% / 0.72) → 0.45` so text has a solid backdrop.

## 2. Stats section — declutter

`cta-surface` card + separate Joint Commission block currently render as two heavy stacked slabs with lots of vertical padding.

Fix in Landing stats section:
- Reduce card padding: `p-8 md:p-14` → `p-8 md:p-10`.
- Reduce grid divider weight: `bg-white/15` → `bg-white/10`, inner tiles `bg-white/[0.06]` → `bg-transparent`, cell padding `p-6 md:p-10 lg:p-12` → `p-6 md:p-8`.
- Reduce gap between stats card and JCo block: `mt-16 md:mt-24` → `mt-10 md:mt-14`.
- Slim JCo block: `p-8 md:p-12` → `p-6 md:p-10`, badge `h-20 md:h-28` → `h-16 md:h-20`.
- Section vertical rhythm: `py-16 md:py-24` → `py-14 md:py-20`.

## 3. "Programs for Every Stage" — capsule + card layout

Currently the "Most Popular" / "Recommended" chip is a `chip chip-brand` pill absolutely positioned inside the card at `top-3.5 right-3.5`. It overlaps the year chip below and looks crowded on small cards.

Fix each program card:
- Move the popular/recommended pill out of absolute positioning into a normal header row at the top of the card (`flex items-center justify-between mb-4`) with the year chip on the left and the ribbon chip on the right; render an empty spacer when neither ribbon applies so all four cards align.
- Give the ribbon its own visual weight: replace `chip chip-brand` with a smaller `.chip` variant using solid brand background + white text (uppercase, tracking-wider, `px-2.5 py-1`, `rounded-full`) — inline classes only.
- Card padding tightened: `p-6 md:p-8` → `p-6 md:p-7`.
- Ensure equal card heights via existing `h-full`.

## 4. Testimonials — add image inside circle

The avatar circle currently shows the first initial only. Replace with a real image while keeping the initial as a fallback:
- Add a small avatar dataset (three names → local placeholder / seeded avatar URL using `https://api.dicebear.com/7.x/initials/svg?seed=<name>` so nothing new is bundled).
- Circle keeps `tile-accent` background as fallback, adds an `<img>` (`object-cover`, `rounded-full`) inside; `onError` reveals the initial fallback.
- Circle size `w-8 h-8` → `w-10 h-10` for legibility.

## 5. Ghost-button contrast on white default

`Partner With Livemed` secondary CTA and Institutions hero's `variant="outline"` buttons currently render as pure white in default state because shadcn's `variant="outline"` uses `border-input bg-background text-foreground`, and the `text-white` override inside `.cta-surface` (from index.css) forces white text but the background stays transparent — so a plain-white surface shows an invisible label until hover.

Fix on both usage sites (`Landing.tsx` Institution CTA, `Institutions.tsx` hero):
- Replace `variant="outline"` with no variant + explicit classes: `bg-white/10 border border-white/40 text-white hover:bg-white/20 backdrop-blur-sm`.
- This gives a visible translucent chip on the blue surface, keeps the white label readable, and drops the shadcn outline defaults that were causing the "white on white" state.

Applies to:
- Landing → "Contact Sales" button (line ~635).
- Institutions → hero "View Case Studies" button (line ~57).

## 6. Institutions — "Ready to Transform" heading color + global spacing pass

- The `Ready to Transform Your Institution?` heading inherits `text-white` inside `cta-surface` (fine), but the surrounding text renders muted; change heading to explicit `text-white` and description to `text-white/85` for stronger hierarchy.
- Also fix the `Rapid Implementation` section step numbers — they currently use `gradient-livemed` circles with `text-white` numerals which are legible; leave numerals but bump size `w-10 h-10` → `w-11 h-11` and step title `font-semibold` → `font-semibold text-base` for consistency.

Global spacing normalization (styling only, per-section class edits):
- Public pages currently mix `py-16 md:py-24`, `py-20 md:py-28`, `py-24 md:py-32`. Standardize on two rhythms:
  - Hero: `py-16 md:py-24`
  - Content sections: `py-16 md:py-24` (was `py-20`/`py-24 md:py-32` in several places)
- Container gutters: unify to `px-4 md:px-6`.
- Files touched: `src/pages/Landing.tsx`, `src/pages/Institutions.tsx`, `src/pages/Programs.tsx`, `src/pages/Rotations.tsx`, `src/pages/Contact.tsx`.

## Out of scope

- No copy, routes, i18n, dashboard, header/footer, or functionality changes.
- No new dependencies.
- Visual-regression snapshots will need refreshing with `bun run test:visual:update` after the pass.

## Verification

- Manual check at `/` and `/institutions`: hero text legible, stats block feels lighter, program cards balanced, testimonials show avatars, all "Contact Sales" / "View Case Studies" buttons show visible label in default state, `Ready to Transform` heading clearly white on blue.
- `tsgo` typecheck stays green (className-only edits + one image URL).
- Refresh visual snapshots after approval.
