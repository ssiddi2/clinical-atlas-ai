# Stats redesign + ribbon contrast fix + testimonial soft palette

Scope: styling only. No content or functionality changes.

## 1. Root cause of the "black text" on Most Popular / Recommended

The ribbon uses `bg-brand text-white`, but the global `text-white*` → dark-navy override in `src/index.css` (lines ~664–675) only exempts a fixed list of brand surfaces (`.cta-surface`, `.btn-brand`, `.tile-accent`, `.bg-brand-gradient`, `.bg-section-dark`, `[data-brand-surface]`). The program-card ribbon sits inside `.lm-card`, so its `text-white` gets forced to dark navy — that's the unreadable "black on blue" the user sees.

Fix: force white via Tailwind's important modifier so it beats the override, and use a solid `bg-brand`:
- `className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-brand !text-white shadow-sm"`
- Add a soft glow: `shadow-[0_4px_12px_-4px_rgba(0,64,221,0.45)]` so the pill lifts off the card.

## 2. Stats section — cooler palette + animation

Currently the stats sit inside a solid blue `cta-surface` slab which feels heavy and mono-blue.

Redesign in `src/pages/Landing.tsx` stats section:
- Replace `cta-surface` wrapper with a cool slate/blue-grey surface: `bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100 border border-slate-200/70 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]`.
- Grid divider: `bg-white/10` → `bg-slate-200/70`, cells `bg-transparent`.
- Numerals: `text-white` → `text-gradient-livemed` (blue gradient on light bg — much cooler feel, and readable).
- Labels: `text-white/70` → `text-slate-500`.
- Specialties caption: `text-white/70` → `text-slate-500`.

Add lightweight animations (using existing framer-motion already imported):
- Number counter: each stat value fades+slides in with a stagger (already have `staggerContainer` + `fadeInScale`). Wrap each numeral in a `motion.span` with a slight `y: 12 → 0` + `opacity 0 → 1`, `duration: 0.5`, staggered by 0.1s.
- On the whole card: add a slow gradient shimmer via a `::before`-style overlay using Tailwind's existing `animate-shimmer` utility (already defined in index.css line 458) layered at low opacity over the card background — gives a subtle "alive" feel without being noisy.
- Optional pulse on the "Live" chip (already animated in css); leave as-is.

## 3. Testimonial — softer color palette

Currently the testimonial card is a plain `lm-card` (white) with hard blue avatar tile and small quote glyph.

Soften in Landing testimonials section:
- Card background: use a warm-neutral tint per card that alternates gently — `bg-gradient-to-br from-slate-50 to-white`, `bg-gradient-to-br from-blue-50/40 to-white`, `bg-gradient-to-br from-indigo-50/40 to-white`. Keeps them cohesive but each feels distinct.
- Border: `border border-slate-200/60`.
- Quote glyph `text-brand/30` → `text-slate-300`.
- Quote text `text-foreground/80` → `text-slate-700`.
- Avatar circle: drop the hard `tile-accent` (bright blue) for a soft gradient `bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-1 ring-white`. Keep the dicebear image on top.
- Name/role: `text-slate-800` / `text-slate-500`.
- Divider line: `border-border` → `border-slate-100`.
- Add gentle hover: `hover:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] transition-shadow duration-300`.

## Out of scope

- No copy, routes, i18n, functionality, or dashboard changes.
- No changes to other sections or pages beyond the three items above.
- No new dependencies.

## Files touched

- `src/pages/Landing.tsx` — stats redesign, ribbon fix in Programs cards, testimonial recolor.

## Verification

- Manual check at `/`: stats card is cool slate/blue with animated numerals, "Most Popular" / "Recommended" pills clearly show white text on brand blue, testimonials look softer and calmer.
- `tsgo` typecheck stays green (className-only edits).
