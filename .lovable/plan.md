## Goal
Ensure every button, tab, link, and quick-action in the Admin, Student, Physician, and Settings (Profile) surfaces routes to a real, working page — no dead ends, no "coming soon" toasts on core flows, consistent AppShell headers everywhere.

## Audit Scope

### Student surfaces (from `/dashboard`)
- Quick actions: Ask ATLAS, My Courses, Virtual Classroom, Curriculum, Live Rounds, Take Assessment, QBank, Score Predictor, Residency, Diagnostic
- Learning Journey / StudyPlan widget links
- Notifications, Profile/Settings menu

### Physician surfaces (`/physician-dashboard`)
- Create Course, Manage Courses, Invite students, Virtual Rounds tile
- LOR tile currently shows "coming soon" toast → dead end
- Confirm AppShell header is used (currently uses its own header — inconsistent with the rest of the app)

### Admin surfaces (`/admin`)
- Tabs: Overview, Professors, Students, Courses, Applications, Rotation Apps, Verifications
- Row actions inside each tab (approve/reject/edit/impersonate) — confirm each is wired to a working handler and refreshes state
- Missing pieces to add if absent: Content Reviews tab (table exists), Contact Inquiries tab (table exists)

### Settings (`/profile`)
- Currently a single page. Break into tabs: Account, Membership, Verification, Notifications, Security (change password / sign out).
- Ensure "Upgrade" link `/pricing` resolves (route doesn't exist today → 404). Either add the route or point to `/apply`.

## Fix Plan

1. **Route completeness pass**
   - Add any missing routes referenced by buttons/links (e.g. `/pricing` → redirect to `/apply`, or create a stub Pricing page).
   - Wire physician "LOR" tile to a real `/physician/lor` page (list + request flow) instead of a toast.
   - Ensure NotFound page has a clear "Back to Dashboard" CTA (already exists — verify).

2. **AppShell consistency**
   - Wrap `PhysicianDashboard` and `Profile` in `AppShell` so header/logo/nav match Student + Admin.
   - Remove duplicate inline headers.

3. **Admin tab hardening**
   - Verify each tab's list component (`ProfessorsList`, `StudentsList`, `CoursesList`, `ApplicationsList`, `RotationApplicationsList`, `VerificationsList`) renders, handles empty state, and every row action calls the `admin-actions` edge function and refetches.
   - Add two new tabs backed by existing tables: **Content Reviews** (`content_reviews`) and **Contact Inquiries** (`contact_inquiries`) with read + status-update actions via `admin-actions`.

4. **Student dashboard dead-end sweep**
   - Confirm each quick-action target page loads for a student with no data (empty states, not blank screens).
   - Fix any tile whose destination is missing or 404s.

5. **Settings page redesign**
   - Convert `/profile` to a tabbed Settings page: Account · Membership · Verification · Notifications · Security.
   - Move sign-out and password change here. Wire notification preferences to `profiles` columns (add columns via migration only if missing).

6. **Verification pass**
   - Typecheck.
   - Playwright smoke: log in as student/physician/admin demo accounts, click every top-level tile/tab, assert no 404 and no console errors.

## Out of scope
- New feature functionality beyond wiring existing tables/pages.
- Visual redesign — only fixes to match existing light theme + AppShell.

## Question before I start
Do you want me to (a) implement all six steps above in one pass, or (b) start with the highest-impact ones (route completeness + Admin tabs + Settings tabs) and defer the physician LOR page and notification preferences to a follow-up?
