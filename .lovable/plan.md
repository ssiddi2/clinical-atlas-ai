# Align Programs, Rotations, Institutions, Contact with the New Livemed design system

Landing was already reworked to use the New Livemed tokens (`.lm-card`, `.glass`, `.cta-surface`, `.chip`, `.bg-section-*`, brand gradient buttons). The four pages above still use the pre-migration patterns and reference `.gradient-livemed-light`, which no longer exists — so their heroes render as flat white and their CTA cards look nothing like Landing's CTA. This plan is styling-only. No copy, sections, routes, functionality, or i18n keys change.

## Diagnosis

- `.gradient-livemed-light` is used on `Programs`, `Rotations`, `Contact`, `About` hero backgrounds but is **not defined** in `src/index.css` → the intended tinted hero backdrop is missing.
- Hero blocks are plain centered `h1 + muted p` — no eyebrow chip, no brand-tone framing, no rhythm break vs. the sections below.
- CTA blocks use `Card` / `section` with the raw `gradient-livemed` fill. Landing's equivalent CTA uses `.cta-surface` (radial glow + dot pattern + brand gradient + inset highlights).
- Feature / benefit cards use raw shadcn `Card` with default radius and shadow — Landing uses the unified `.lm-card` with 20 / 28px radius and the paired shadow tokens.

## Changes

### 1. Add the missing hero backdrop utility to `src/index.css`
Introduce `.gradient-livemed-light` inside the New Livemed utilities block so the existing markup on all four pages instantly picks up the correct subtle brand wash:

```css
.gradient-livemed-light {
  background:
    radial-gradient(60% 80% at 80% 0%, color-mix(in oklab, var(--brand-3) 14%, transparent), transparent 60%),
    linear-gradient(180deg, hsl(var(--background)), var(--surface-tint));
}
```

This mirrors `.bg-section-glow` and matches the tint used on Landing's hero fadeout.

### 2. `src/pages/Programs.tsx`
- Hero section: keep `<h1>` copy; add a `.chip chip-brand` eyebrow above the title (translated key already exists as `programs.page.subtitle` — reuse when appropriate, otherwise reuse `nav.programs`). Wrap heading in `font-display`, use the standard body class for the paragraph.
- Tab program cards: swap the outer wrapper `Card` for `<div className="lm-card-lg">` where the large program panel lives; keep small stat cards as `<div className="lm-card">`. Icon tile keeps `gradient-livemed` (already retuned to brand).
- Bottom "Ready" CTA (line ~245–265): convert the `Card` to a `<section className="cta-surface rounded-[28px] p-10 md:p-14 text-center">` matching Landing's CTA. The button becomes the outline-on-brand pill variant used elsewhere.
- Add `bg-section-tinted` alternation for the middle Tabs section.

### 3. `src/pages/Rotations.tsx`
- Hero: chip eyebrow + `font-display` title, keep the existing `.gradient-livemed-light` backdrop (now that it exists).
- Rotation cards: `Card` → `<article className="lm-card lm-card-interactive">`; icon tile keeps `gradient-livemed` fill.
- Bottom `<section className="py-20 gradient-livemed">` → `<section className="cta-surface rounded-[32px] my-20 mx-4 md:mx-8 p-12 md:p-16 text-center">` so the CTA becomes a floating brand block instead of a full-bleed slab. Container wrapper reduces to `max-w-5xl`.
- Buttons on the CTA get `variant="secondary"` with `bg-white text-brand hover:bg-white/90` to preserve contrast on the brand surface.

### 4. `src/pages/Institutions.tsx`
- Hero (`gradient-livemed` full-bleed): replace fill with `cta-surface` styling so the hero reads as the signature brand block (matches how Landing frames its dark CTAs). The inline pill (`bg-white/10 text-white`) is preserved but its container becomes the `cta-surface` treatment.
- Stat tiles: wrap each stat in `<div className="lm-card text-center">` using `stat-value` / `stat-label` typography.
- Benefit grid: `Card` → `<article className="lm-card lm-card-interactive">`. Icon chip keeps `gradient-livemed`.
- Steps section stays as a numbered list but each row wraps in `.hairline` divider using the shared border token.
- Bottom "Ready to transform" `Card`: → `cta-surface`.

### 5. `src/pages/Contact.tsx`
- Success state card: replace check-circle callout with `.lm-card-lg` + `tile-accent` for the circle.
- Hero: chip eyebrow + `font-display` title on top of the now-real `.gradient-livemed-light`.
- Right-column info `<Card className="gradient-livemed text-white">` (Livemed contact info): → `cta-surface` rounded card, so it reads as the branded sidebar callout instead of a solid blue tile.
- Form card: wrap the shadcn `Card` in `.glass-strong` styling by adding `className="glass-strong rounded-3xl p-6 md:p-8"` on the outer wrapper (keeps form fields intact).
- Submit button: `gradient-livemed` → `btn-brand rounded-full`.

### 6. Global consistency touches (styling-only)
- Wrap each page's outermost `main` sections with alternating `bg-section-default` / `bg-section-tinted` (max 3 alternations per page) so the section rhythm matches Landing.
- Where a page uses `text-muted-foreground` for lede paragraphs directly under `h1`, swap to `text-soft` so the color tone lines up with Landing.
- No other pages, components, or shared UI are touched.

## Verification

- Manual eyeball at `/programs`, `/rotations`, `/institutions`, `/contact` against `/` for hero, CTA, and card treatment parity.
- Run `bun run test:visual:update` to refresh the four page baselines + design-system swatch snapshots; then `bun run test:visual` should be green.
- Confirm no console errors or missing i18n keys were introduced (the change is purely className-level).

## Out of scope

- No changes to copy, i18n keys, routes, layout components, `Header`, `Footer`, forms behavior, or backend.
- Dashboard / auth / admin surfaces are untouched.
- Landing.tsx is untouched.
