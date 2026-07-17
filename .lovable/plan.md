# Revert hero tighten + merge Stats & Accreditation into one section

Two changes, both in `src/pages/Landing.tsx`.

## 1. Revert the hero tightening (desktop branch)

Restore the pre-tightening desktop hero exactly:

- Section: `min-h-[80vh] py-20 md:py-24` → `min-h-screen` (drop `py-20 md:py-24`).
- Enrolling chip margin: `mb-6` → `mb-10`.
- "Livemed — AI-Powered Virtual Specialty Care" eyebrow: back to the large gradient block  
  `text-2xl md:text-3xl font-semibold text-gradient-livemed mb-4 tracking-wide`  
  (not the small uppercase chip).
- Re-insert the decorative radial-glow div above the h1.
- Headline: `text-5xl md:text-6xl lg:text-[64px] xl:text-[72px] … mb-5 leading-[1.05]`  
  → `text-5xl md:text-6xl lg:text-7xl xl:text-[96px] … mb-6 leading-[1.1]`.
- Subtitle margin: `mb-8` → `mb-14`.

Mobile branch stays untouched (it was never modified).

## 2. Merge Stats + Joint Commission into one premium section

Replace the two stacked cards (stats card + accreditation card underneath it) with a single unified section. Same content, richer composition, less vertical footprint.

New layout — one outer card:

```
┌───────────────────────────────────────────────────────────┐
│ [JCo badge]  Accredited by The Joint Commission           │
│              National Quality Approval · <description>     │
│───────────────────────────────────────────────────────────│
│   50+          15+          10+                            │
│   HOSPITALS    SPECIALTIES  CITIES     (animated numerals) │
│───────────────────────────────────────────────────────────│
│  Specialty rotations spanning [specialties line]           │
│                                                            │
│  Now enrolling · Contact info@livemedhealth.com            │
└───────────────────────────────────────────────────────────┘
```

Structural details:

- Wrapper: keep the existing `relative rounded-[32px] p-8 md:p-12 max-w-6xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100 border border-slate-200/70 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] overflow-hidden` and its `animate-shimmer` overlay — this becomes the whole section's single card.
- Top row (accreditation header): two-column flex on md+, stacked on mobile.
  - Left: JCo badge, `h-16 md:h-20 w-auto`.
  - Right: title + one-line description, left-aligned on md+, centered on mobile.
    - Title: `font-semibold text-lg md:text-xl tracking-tight` — `accreditation.title`.
    - Subtitle inline: `accreditation.subtitle` in `text-soft text-sm md:text-base font-medium`.
    - Description: `accreditation.description` in `text-softer text-xs md:text-sm max-w-lg leading-relaxed`.
- Divider: `my-8 md:my-10 border-t border-slate-200/70`.
- Stats grid: reuse the existing 3-column stats markup (both `noAnim` and `motion` variants) exactly as-is, including numerals with `text-gradient-livemed` and staggered motion. Remove its wrapper `bg-slate-200/70 gap-px overflow-hidden rounded-2xl` since it now sits inside the unified card — replace with a lighter `divide-x divide-slate-200/70` grid so cells share hairline dividers with the outer card.
- Below stats: `specialties` caption (unchanged text).
- Bottom row: single centered line combining `accreditation.enrolling` + " · " + `accreditation.contact` with the email link — kept small (`text-softer text-xs md:text-sm`) so it doesn't compete with the stats.
- Remove the separate `mt-10 md:mt-14 max-w-2xl mx-auto glass-strong` accreditation card entirely (lines 318–352).
- Section outer padding stays `py-14 md:py-20`.

Everything visible today (all i18n keys, badge image, stats numbers, specialties caption, contact line) remains — nothing dropped. No color/type token changes.

## Files touched

- `src/pages/Landing.tsx` — desktop hero block (lines ~143, 208, 217–239, 241–246) reverted; stats + accreditation sections (lines ~261–353) merged.

## Verification

- Hero renders identically to before the tightening (min-h-screen, big gradient eyebrow, 96px headline at xl, radial glow, wide spacing).
- Stats + Accreditation now share one card; JCo badge appears as the section's header with title and description alongside it.
- Stat numerals still animate and use `text-gradient-livemed`.
- Enrolling + contact appears once, centered under the stats.
- No layout shift on other pages/sections.
