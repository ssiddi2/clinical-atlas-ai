# Fix blue-CTA contrast + refresh Landing to match New Livemed

## Root cause of the black-on-blue bug

`src/index.css` (lines 664–675) has a global override that converts every `text-white*` class to dark navy (`rgb(15 23 42)`) except when the element sits inside `[data-hero]` or `.gradient-livemed`. When the Livemed migration added the `.cta-surface` block (blue gradient CTA used on Institutions / Rotations / Programs / Contact / the future Landing CTA), the override wasn't updated, so every `text-white` / `text-white/80` child of `.cta-surface` collapses to dark navy — that's the low-contrast "black text on blue" the user is seeing.

## Fix in two moves

### Move 1 — Restore white text on every branded blue surface (contrast fix)

Edit `src/index.css` overrides so the `text-white*` → dark-navy conversion is skipped on any element inside a branded blue surface. Extend each `[class~="text-white*"]:not(...)` selector to also exclude:

- `.cta-surface`, `.cta-surface *`
- `.bg-brand-gradient`, `.bg-brand-gradient *`
- `.btn-brand`, `.btn-brand *`
- `.tile-accent`, `.tile-accent *`
- `.bg-section-dark`, `.bg-section-dark *`
- `[data-brand-surface]`, `[data-brand-surface] *` (escape hatch for one-off blue blocks)

Same escape list is added to the `bg-white/[0.xx]` and `border-white/[0.xx]` overrides on lines 678–679 so translucent pills / dividers rendered on the CTA keep their glassy look instead of turning into a dark fill.

After this one edit every existing CTA (Institutions hero, Rotations "Ready to start", Programs "Not sure", Contact sidebar, Institutions "Ready to transform") is legible again without touching page code.

### Move 2 — Refresh Landing to match New Livemed's vibrancy

The home page currently keeps its legacy dark wrapper (`bg-livemed-deep`) and dark-slab stats, which the light-theme override flattens into a mostly-white, low-contrast surface — hence the "dull" feel. Rebuild the visual language section-by-section using the utilities already ported from the reference project. Copy and structure stay untouched.

**Hero (`Landing.tsx`, lines ~142–270)**
- Swap outer wrapper: `bg-livemed-deep` → `bg-section-default` (the wrapper still carries `data-hero` so the video overlay behavior is preserved).
- Add a `.bg-section-glow` layer behind the hero video so the fade-out to the next section is the New Livemed mesh wash instead of white.
- Add a `chip chip-brand` "Enrolling" pill (replacing the ambiguous glass pill on light).
- Change the headline to `text-ink` for line 1 and `text-gradient` for line 2 (currently `text-white/90` + `text-gradient-livemed` — both look muted after the override).
- Keep the video and framer-motion timings.
- Primary CTA becomes `btn-brand rounded-full` (already the correct token) — no change.

**Stats band (~lines 272–355)**
- Replace the dark full-bleed slab (`bg-livemed-deep` + `bg-white/[0.06]` divider grid) with a floating `cta-surface rounded-[32px]` card, `max-w-6xl mx-auto`, `text-white` figures + `text-white/70` labels. Now legible thanks to Move 1.
- Joint Commission strip below becomes a `glass-strong rounded-2xl` block on `bg-section-tinted`, matching the reference's credential blocks.

**Feature / value-prop grid**
- Convert existing feature cards to `article.lm-card.lm-card-interactive` with a `tile-accent` icon square (blue gradient tile with white icon — replaces the current flat icon).
- Section wrapper: `bg-section-tinted` alternated with `bg-section-glow`.

**Programs / rotations preview grid**
- Same `lm-card lm-card-interactive` treatment, brand-tinted icon tiles, small `chip` labels for category, `text-soft` supporting copy.

**Final CTA**
- Replace the current dark call-to-action with a `cta-surface rounded-[32px] p-12 md:p-16 max-w-5xl mx-auto` block matching the pattern now used on other pages, buttons `bg-white text-primary` and `border-white/30 text-white`.

**Section rhythm on Landing**
`bg-section-default (hero) → cta-surface (stats) → bg-section-tinted (JCo strip) → bg-section-glow (features) → bg-section-default (programs) → bg-section-tinted (proof) → cta-surface (final CTA)` — matches the alternating light/tint/brand cadence of the reference.

## Out of scope

- No copy, i18n keys, routing, or functionality changes on Landing or any page.
- No changes to Header, Footer, or dashboard/authed surfaces.
- No new dependencies.

## Verification

- Manual check at `/`, `/institutions`, `/rotations`, `/programs`, `/contact`: white text on every blue-gradient surface, alternating light/tinted section rhythm on Landing.
- `bun run test:visual:update` to refresh baselines for landing + the four page snapshots; `bun run test:visual` should pass after refresh.
- `tsgo` typecheck stays green (no new symbols beyond className strings).
