# Tighten the hero vertical rhythm

The hero section is currently `min-h-screen` and stacks five vertical blocks — chip, eyebrow ("Livemed — AI-Powered Virtual Specialty Care"), 4-line headline, subtitle, CTA — with generous margins between each (`mb-10`, `mb-4`, `mb-6`, `mb-14`). On a 1440×900 laptop this leaves large empty bands above and below the content. The user wants it compact, not vertically airy.

## Changes (desktop hero only, `src/pages/Landing.tsx` lines 203–265)

1. Section height: `min-h-screen` → `min-h-[80vh]` with `py-20 md:py-24` so it's tall enough to feel like a hero but no longer forces full viewport height.
2. Merge the "Livemed — AI-Powered Virtual Specialty Care" eyebrow onto a single inline chip row instead of a large standalone gradient block:
   - Remove the separate `text-2xl md:text-3xl font-semibold text-gradient-livemed mb-4` line.
   - Keep the enrolling chip, and add the academy tagline as a subtle uppercase eyebrow directly above the h1: `text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-brand mb-4`. This alone reclaims roughly 60–80px.
3. Headline size step down: `text-5xl md:text-6xl lg:text-7xl xl:text-[96px]` → `text-5xl md:text-6xl lg:text-[64px] xl:text-[72px]`, `leading-[1.1]` → `leading-[1.05]`. Still commanding, ~30% less height at xl.
4. Reduce inter-block spacing:
   - Chip `mb-10` → `mb-6`
   - Eyebrow `mb-4` → `mb-3`
   - Headline `mb-6` → `mb-5`
   - Subtitle `mb-14` → `mb-8`
5. Remove the decorative absolute radial-glow div (lines 224–230). It only adds visual weight in an already busy hero and doesn't affect the layout height directly, but removing it declutters and lets the compaction breathe.

Mobile branch stays untouched — it's already compact.

Everything else (typography families, colors, gradients, video, animations, CTA) stays identical.

## Files touched

- `src/pages/Landing.tsx` — desktop hero block only

## Verification

- At 1440×900: hero fits ~720px tall with visible content below on scroll
- Chip, eyebrow, headline, subtitle, CTA still read as a single centered composition
- Mobile viewport unchanged
- No color/type/component changes elsewhere
