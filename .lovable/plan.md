## Changes to `src/pages/Dashboard.tsx`

**1. Remove duplicated top navigation**
The sticky header currently renders a second icon-nav row (My Courses / Virtual Classroom / Live Rounds / Assessments) that duplicates the Quick Actions grid directly below it. Remove that `<nav className="hidden lg:flex ...">` block (lines 244–260) entirely. Keep the logo, the "Curriculum" link, and the "ATLAS™" gradient AI chip in the top-left cluster.

**2. Make Learning Journey stat icons solid + white**
In `src/components/dashboard/LearningJourney.tsx`, the stat tiles currently use a tinted background with a same-hue icon (e.g. `bg-blue-100 text-blue-600`). Switch each to a saturated colored square with a white glyph to match the Quick Action tiles:
- Study Time → `bg-blue-500 text-white`
- Questions Answered → `bg-sky-500 text-white`
- Topics Covered → `bg-emerald-500 text-white`
- Streak → `bg-violet-500 text-white`

**3. Remove arrows from the vertical/quick-action menu**
Drop the trailing `ChevronRight` from each Quick Action card (line 334) so the tiles show only the colored icon + label with no chevron. Also clean the now-unused `ChevronRight` import if no other usage remains (it's still used in the diagnostic CTA, so keep the import).

No behavioral or data changes — presentation only.