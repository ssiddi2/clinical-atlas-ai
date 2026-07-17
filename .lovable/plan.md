## Goal
Rebuild the student dashboard so it exactly matches the attached reference — colors, spacing, illustrations, and section presence. Fix the parts that drifted in the last pass and remove sections that don't exist in the reference. Ensure responsive behavior at desktop/tablet/mobile.

## Precise diffs vs the reference (what to correct)

### Header
- Nav icons are OUTLINED rounded squares with a small text label underneath — match reference sizing (icon tile ~36px, label `text-[11px]`, muted foreground). Currently close but the tiles read too heavy — reduce border weight and use `text-muted-foreground` with `hover:text-primary` only, no background fill.
- Bell shows a red count badge (currently a subtle badge). Keep `NotificationBell` as-is — it already handles counts; verify styling matches.
- User pill: circular avatar + first-name + chevron in a full pill (border, `rounded-full`). Confirm avatar size 32px and pill has subtle border. Already implemented — keep.

### Verification banner (`src/components/dashboard/VerificationBanner.tsx`)
- Reference background is soft cream/peach, not amber-yellow. Change to `bg-orange-50 border-orange-200`.
- Icon is orange `AlertCircle` in matching orange color (`text-orange-500`), no filled circle background.
- Title bolder (`font-semibold text-base`), description on two lines.
- "View Status" button = outlined orange (`border-orange-300 text-orange-600 hover:bg-orange-100`).
- Increase padding to `p-5` and radius `rounded-2xl`.

### Welcome heading
- Reference is very large — `text-4xl md:text-5xl font-bold`, tracking-tight, with waving hand emoji inline. Already `text-4xl` — bump to `md:text-5xl` and tighten spacing.

### Quick action tiles
- Reference tiles are BIG cards: `p-5`, icon tile `w-12 h-12 rounded-2xl`, label wraps to 2 lines (`font-semibold text-base leading-tight`), chevron `h-5 w-5 text-muted-foreground` on the right. Card border `rounded-2xl`.
- Colors already correct.
- Grid: 2 cols mobile, 3 cols tablet, 6 cols desktop — keep.

### Left column
1. **Diagnostic card** — reference:
   - White card, `rounded-2xl`, subtle border.
   - Header row: dark navy circle (`bg-primary`) with a concentric "target" icon (use `Target` — increase strokeWidth). Title + solid blue "Recommended" pill.
   - Subline "Personalize your learning journey".
   - Paragraph description.
   - Solid blue `Start Diagnostic →` button with tighter arrow icon.
   - Meta row with muted clock + target icons.
   - RIGHT illustration: soft light-blue rounded panel with clipboard + target composition — keep current composition but scale up (`w-52 h-52`), use `text-primary` and add a small check bubble.
2. **Continue Where You Left Off** — reference:
   - Card header shows a small BLUE OPEN-BOOK icon (use `BookOpen` with `text-primary`) + title.
   - Inner empty state: light gray `bg-slate-50 rounded-xl p-5` with book-icon avatar in a soft rounded tile on the left, two-line copy, and OUTLINED blue "Browse Courses" button on the right (`variant="outline" border-primary text-primary rounded-lg`).

### Right column (sidebar)
1. **Upcoming card** — matches reference (calendar icon, View All link, empty-state illustration + two-line copy). Already implemented — verify spacing.
2. **MATCH Ready** — already `MatchReadyWidgetWrapper`. Verify visual against reference and adjust wrapper padding if needed.
3. **REMOVE** the extra "Join Live Rounds" gradient card currently in the sidebar — not in the reference.

### Bottom section
- **REMOVE** the "ATLAS Chat Preview" card from the left column — not in the reference.
- **Replace** `StudyPlanWidget` (which renders nothing without a plan) with a new **Learning Journey stat strip** matching the reference:
  - Card header: title "Your Learning Journey" + subtitle "Track your progress and achievements", "This Week" select on the right.
  - Body: 4-column grid of stat tiles (Study Time / Questions Answered / Topics Covered / Streak) each with a colored icon (blue/blue/green/purple), big number, unit label.
  - Data source: fetch quick counts from existing tables — `question_attempts` for questions answered; if the queries are non-trivial, render zero-state numbers (matches reference which shows near-empty state).
  - New file: `src/components/dashboard/LearningJourney.tsx`.
  - Keep `StudyPlanWidget` mount only when a plan exists — render it BELOW the Learning Journey (non-blocking; it self-hides when empty).

### Responsive rules
- `grid-cols-1 lg:grid-cols-3` for the main split; stack on mobile.
- Quick actions `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`.
- Learning Journey stats `grid-cols-2 md:grid-cols-4`.
- Header center-icon nav hides below `lg`; on mobile keep logo + right cluster (bell/gear/user).
- All cards use `rounded-2xl`, section spacing `gap-6 lg:gap-8`, main content `container mx-auto py-8`.

## Files to modify
- `src/pages/Dashboard.tsx` — apply header, quick-action, diagnostic, continue, sidebar, and section removals above.
- `src/components/dashboard/VerificationBanner.tsx` — recolor pending banner.
- `src/components/dashboard/LearningJourney.tsx` — NEW widget.

## Out of scope
- No changes to physician/admin dashboards, RLS, i18n keys, or other pages.

## Verification
- Type-check with `tsgo`.
- Screenshot `/dashboard` at 1440 and 390 widths via Playwright with the demo student session and compare side-by-side with the reference. Iterate on spacing until visually aligned.
