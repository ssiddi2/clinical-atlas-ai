## Goal
Unify every icon on the student dashboard to a white glyph sitting in a colored rounded tile, and rebalance the page so sections feel evenly weighted.

## Icon pass — `src/pages/Dashboard.tsx` + sidebar widgets

Wrap every icon that currently renders as a bare dark/primary-colored glyph in a small colored tile with a white glyph. Standard: `w-9 h-9 rounded-xl bg-<hue>-500 text-white` for section-header icons, `w-11 h-11 rounded-xl` for quick actions (already done).

Locations to convert:
- **Header** — bell (`NotificationBell`) and Settings gear currently render as flat dark icons in the top-right. Give each a subtle `bg-muted` circular button so they stop reading as black glyphs floating on white; keep them icon-only.
- **Continue Learning card title** — `BookOpen` in blue → tile: `bg-blue-500 text-white`.
- **Upcoming card title** — `Calendar` in blue → tile: `bg-violet-500 text-white`.
- **Upcoming empty state** — `CalendarCheck` → tile: `bg-emerald-500 text-white` (drop the pastel bg).
- **Empty-state "No courses enrolled"** — `BookOpen` → tile: `bg-slate-500 text-white`.
- **Diagnostic card** — `Target` in the header tile stays white (already correct); the decorative `ClipboardCheck` illustration (currently `text-primary`) becomes white sitting inside a gradient tile so it doesn't read as a black shape.
- **Learning Journey** stat tiles — already white glyphs (previous turn).
- **MatchReady widget** — audit its title icon and swap to the same tile pattern if it renders a bare dark glyph.

## Layout & balance pass — `src/pages/Dashboard.tsx`

1. **Header rhythm.** Reduce header height from `h-16` to `h-14`, and tighten the left cluster gap so the logo, Curriculum link, and ATLAS chip breathe together. Right cluster: use `gap-1.5` between icon buttons and the account pill.
2. **Vertical rhythm.** `<main>` currently uses `space-y-10 md:space-y-12`. Standardize to `space-y-8` so no block feels orphaned.
3. **Welcome block.** Shrink `text-3xl md:text-4xl` to `text-2xl md:text-3xl` and pull it closer to the quick actions (`mb-0`); the diagnostic card is the intended focal point.
4. **Quick actions.** Keep the 6-up grid but bump gap to `gap-4` and give each card `p-4` with `gap-3.5`. Icon tile stays `w-11 h-11 rounded-xl` with white glyph.
5. **Main grid columns.** Currently `lg:grid-cols-3` with sidebar 1/3. Switch to `lg:grid-cols-[minmax(0,1fr)_360px]` so the sidebar has a fixed comfortable width and the main column can breathe on wide screens. Gap `gap-6`.
6. **Diagnostic card.** Keep the gradient wash, but constrain the copy column to `max-w-lg` and raise the illustration tile to `w-44 h-44` so the two halves balance.
7. **Sidebar card heights.** Give Upcoming and MatchReady a shared `min-h-[220px]` so the sidebar column matches the height of the main column's Continue Learning card.
8. **Learning Journey + StudyPlan.** Full-width below grid, `space-y-6`, same rounded-2xl border-border/70 shadow-sm treatment for visual consistency.

## Notes
Presentation only — no data, routing, or state changes. Uses existing Tailwind tokens; no new CSS variables.