## Goal

Fix the visible layout bugs in the student dashboard header and quick-action tiles so they match the reference screenshot exactly.

## Current state (verified in `src/pages/Dashboard.tsx`)

- Header renders two nav groups (`Curriculum` / `ATLAS™` on the left, then icon-nav on the right) but the outer `<div class="container">` has no horizontal padding — items collide and text runs together ("CurriculumATLAS™", "My CoursesVirtual Classroom…").
- Quick-action tiles wrap the lucide icon in a colored `rounded-2xl` box with `text-white`, but the box is too large (w-12 h-12) and the icons look mis-scaled vs. the reference where each icon sits snugly inside a smaller rounded square.
- ATLAS™ link is a plain muted text link — user wants it visually distinguished as an AI feature.

## Changes — `src/pages/Dashboard.tsx` only

### 1. Top navigation

- Add horizontal padding to the header container (`px-4 md:px-6`) and switch the layout to three balanced sections with proper gaps so groups can't touch.
- Left cluster: logo, then `Curriculum` and `ATLAS™` as separate pill/text links with `gap-6` between them.
- Distinguish `ATLAS™` as AI: render it as a small gradient chip (blue→violet) with a `Sparkles` icon, e.g. `bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-full px-3 py-1 text-xs font-semibold` — matches the "AI" cue the user asked for while staying compact.
- Middle icon-nav (My Courses / Virtual Classroom / Live Rounds / Assessments): keep icon-above-label, but tighten the tile to a borderless icon (no bordered square) exactly like the reference — a `flex-col items-center` with icon (h-5 w-5) and 11px label below, `gap-8` between items, muted-foreground → primary on hover. This matches the reference where icons are floating, not boxed.
- Right cluster: notification bell, settings gear, then user pill (avatar + name + chevron) — already correct, just verify spacing.
- Ensure the header uses `container mx-auto px-4 md:px-6` and `gap-8` between the three groups so nothing overlaps at 1024–1280px widths.

### 2. Quick-action tiles

Match the reference exactly:
- Reduce icon-box from `w-12 h-12` to `w-11 h-11` and use `rounded-xl` (not `2xl`) so the icon fits snugly like the reference.
- Keep `text-white` on the icon and the colored background — the icon is already white in code; the reason it looks off is the oversized container. Downsize icon to `h-5 w-5` centered inside the box so it visually "fits inside" as requested.
- Keep the 6-column responsive grid, chevron on the right, semibold label.
- Colors stay: ATLAS blue, My Courses violet, Virtual Classroom emerald, Curriculum amber, Live Rounds rose, Take Assessment orange (already matches reference).

### 3. Nothing else changes

- No changes to VerificationBanner, Diagnostic card, Upcoming, MATCH Ready, Continue Learning, or LearningJourney — those already match the reference.
- No route, data, or business-logic changes.

## Verification

- Read the file at 1044px viewport (current preview width) via a Playwright screenshot after the edit to confirm header items no longer collide and quick-action icons visually sit inside their colored boxes like the reference.
