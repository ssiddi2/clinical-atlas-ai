

# Production Readiness: Attending Onboarding, Student Onboarding & Live Sessions Plan

## Current State Audit

**What exists:**
- Attending/physician role exists (`physician` role) → routes to `/physician-dashboard`
- Physicians can create courses, lectures, topics, materials, quizzes
- Students sign up → pending approval → admin approves → onboarding chat → document upload → dashboard
- Course enrollment workflow (student requests → instructor approves)
- Virtual Classroom with `meeting_url` field on lectures (already supports any video link — Google Meet, Zoom, etc.)
- Admin can create users directly via `CreateUserModal` with auto-approve
- Lecture attendance tracking exists

**Gaps for production launch in 2 days:**
1. No clear "Attending" signup path tested — physician role exists but needs verification
2. Google Meet integration is manual (paste URL) — works but no helper UI
3. No bulk student invite tool for an attending to onboard their cohort
4. Demo data may pollute the production view
5. Email notifications for enrollment/lecture reminders not verified

---

## Plan: Three Tracks

### Track A — Attending (You) Setup
1. **Verify your attending account exists.** If not, admin-create a `physician` account for you (email + password) with auto-approve.
2. **Confirm `/physician-dashboard` access** — you'll see Courses, Lectures, Students tabs.
3. **Create your first Course** (e.g. "USMLE Step 2 CK – Internal Medicine Rounds") via the dashboard.
4. **Build the curriculum** using the Course Topics tree (System → Topic → Subtopic) so students see real content in `/curriculum`.

### Track B — Student Onboarding (Bulk)
**Add an "Invite Students" feature on the physician dashboard:**
- Bulk paste emails OR upload CSV (email, first_name, last_name)
- For each: edge function creates the auth account (auto-approved + auto-enrolled in chosen course) and emails them a temp password + login link
- Reuses existing `admin-create-user` pattern but scoped to physician's own course (new edge function: `physician-invite-students`)
- Students log in → skip approval wall → land on dashboard with the course already enrolled → optional onboarding chat

**Files to add/edit:**
- New edge function: `supabase/functions/physician-invite-students/index.ts` (validates caller is physician + owns course, creates users, enrolls them, sends welcome email via Resend or logs creds)
- New component: `src/components/physician/InviteStudentsModal.tsx` (paste emails or CSV upload)
- Update `src/pages/PhysicianDashboard.tsx` — add "Invite Students" button per course
- Update `supabase/config.toml` — register new function

### Track C — Live Session via Google Meet
**Confirm: Yes, you can use your personal Google Meet — no integration needed.**
- When creating a lecture (`CreateLectureModal`), the `meeting_url` field accepts any URL
- **Improvement:** Add a "Generate Meet Link" helper text + validation that the URL is a valid `meet.google.com/*`, `zoom.us/*`, or `teams.microsoft.com/*` link
- Add a prominent "Join Live Session" button on student dashboard 15 min before scheduled start (already partially built in `LectureCard`)

**Files to edit:**
- `src/components/classroom/CreateLectureModal.tsx` — add helper text "Paste your Google Meet / Zoom link"
- `src/components/classroom/LectureCard.tsx` — verify the join button shows for enrolled students at the right time

### Track D — Production Hardening (must-do before launch)
1. **Disable demo data seeding** in production — verify `useSeedDemoData` is admin-only / disabled
2. **Enable Leaked Password Protection** in Cloud auth settings (1-click)
3. **Email confirmation** — confirm new student signups get verification emails (or auto-confirm if you prefer instant access for invited students)
4. **End-to-end smoke test** (after build):
   - Create attending account → log in → create course → invite 2 test students → both log in → both see course → start a Meet → both join → mark attendance → assign quiz → student takes quiz → score appears on physician dashboard

---

## Files Changed
1. `supabase/functions/physician-invite-students/index.ts` — NEW (bulk invite + auto-enroll)
2. `supabase/config.toml` — register function
3. `src/components/physician/InviteStudentsModal.tsx` — NEW
4. `src/pages/PhysicianDashboard.tsx` — add invite button
5. `src/components/classroom/CreateLectureModal.tsx` — Google Meet helper UI
6. `src/components/classroom/LectureCard.tsx` — verify join-live timing logic

## No Database Changes
All required tables (`courses`, `course_enrollments`, `user_roles`, `profiles`) and RLS policies already exist.

## Post-Build Testing Checklist (I will run after implementation)
- [ ] Create your attending account
- [ ] Log in as attending → create test course
- [ ] Bulk-invite 2 dummy students
- [ ] Log in as student → confirm auto-enrollment + course visible in `/courses` and `/curriculum`
- [ ] Schedule a lecture with a Google Meet link → confirm student sees join button
- [ ] Student takes a quiz → physician sees score
- [ ] Confirm Leaked Password Protection is on

