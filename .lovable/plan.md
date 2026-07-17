## Goal
Refine `src/pages/Dashboard.tsx` so the student dashboard visually matches the attached reference exactly. No backend or data changes — presentation only.

## Reference layout (from screenshot)
1. **Header** — logo left, "Curriculum" + "ATLAS™" small links next to it, centered nav with icon-above-label items (My Courses, Virtual Classroom, Live Rounds, Assessments), right side: bell (with red count badge), settings gear, user pill (avatar + name + chevron).
2. **Verification Pending banner** — soft amber background, orange alert icon, bold title + description, "View Status" outlined button on the right.
3. **Welcome heading** — large bold `Welcome back, Dr. Sarah! 👋` with muted subline.
4. **Quick action tiles (6)** — white cards with rounded colored square icon on the left, label wrapping to 2 lines, small chevron on the right. Colors: Ask ATLAS (blue), My Courses (purple), Virtual Classroom (green), Curriculum (amber), Live Rounds (red), Take Assessment (orange).
5. **Two-column grid**:
   - Left (2/3):
     - **Take Your Diagnostic Assessment** card — dark blue circular target icon, title with blue "Recommended" pill, description, blue "Start Diagnostic" button + `~40 minutes` and `Personalized plan` meta, illustration on the right (clipboard + target).
     - **Continue Where You Left Off** card — book icon title, inner light-gray panel with empty state ("No courses enrolled yet…") + outlined "Browse Courses" button.
     - **Your Learning Journey** stat strip below with "This Week" selector.
   - Right (1/3):
     - **Upcoming** card — calendar icon, "View All" link, empty state illustration + "No upcoming sessions / You're all caught up!".
     - **MATCH Ready™** card — lock icon, description, progress bar `0 of 25 questions … 0%`, full-width blue "Start Practice Assessment" button.

## Changes to `src/pages/Dashboard.tsx`
- **Header**: keep functionality; restyle desktop nav items as icon-above-label (stack `icon` + `text-xs`), add the "Curriculum / ATLAS™" secondary links directly to the right of the logo, and replace the bare Settings/LogOut icons on the right with: `NotificationBell`, gear button, and a user pill (`Avatar + first name + ChevronDown`) that opens a small dropdown containing Profile / Sign out. Reduce logo height to `h-8`.
- **Quick actions**: change grid to 6 equal columns on `lg`, taller cards, colored `rounded-xl` icon tile (44px), label as 2-line `font-semibold text-sm`, `ChevronRight` on the right. Update color mapping to match reference (blue / purple / green / amber / red / orange).
- **Diagnostic card**: switch to white card with subtle border (drop gradient background), add right-side illustration slot (use existing lucide icons composed: `ClipboardCheck` + `Target` inside a light-blue rounded panel) sized `~180px`, move "Recommended" pill inline with title as solid blue pill, ensure meta row uses muted icons.
- **Upcoming card** (currently in right column further down): move it up so it sits directly beside the Diagnostic card. Add "View All" link in header. Render empty state with calendar illustration + two-line copy when `upcomingLectures` is empty.
- **Continue Where You Left Off**: wrap empty state in nested `bg-muted/40 rounded-xl` panel with book icon avatar; primary CTA becomes outlined "Browse Courses" linking to `/courses`.
- **MATCH Ready**: keep `MatchReadyWidget` but ensure it sits directly under Upcoming in the right column (already the case) and matches reference styling (verify progress row + full-width blue button; adjust wrapper only if needed).
- **Learning Journey**: keep existing widget; ensure it renders full-width below the two-column grid with the "This Week" selector visible.
- Ensure horizontal padding follows the site container rules (no changes to `tailwind.config.ts`).

## Out of scope
- No changes to data fetching, routing, RLS, i18n keys, or other pages (physician dashboard, admin, etc.).
- No new assets — reuse `lucide-react` icons for illustrations.

## Verification
After edits, run the Playwright visual check against `/dashboard` at 1280×1800 with the demo student session and compare to the reference screenshot; iterate on spacing/colors only if visible mismatches remain.
