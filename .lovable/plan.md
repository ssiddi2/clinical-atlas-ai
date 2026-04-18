

The user wants comprehensive end-to-end testing of the production-ready platform. Since this is in plan mode and testing requires browser automation + edge function calls (which need approval to switch to default mode), I'll present a clear test plan.

Key flows to verify:
1. Attending login → physician dashboard access
2. Course creation
3. Bulk student invite (new edge function)
4. Student auto-enrollment + login
5. Lecture creation with Google Meet link
6. Student sees "Join Live" button
7. Quiz assignment + attempt + score visibility
8. Security posture (RLS, leaked password protection)

# Comprehensive Production Smoke Test Plan

## Test Strategy
I'll execute a full end-to-end test using browser automation + direct edge-function calls + database queries. Any bug found gets fixed immediately, then re-tested.

## Test Phases

### Phase 1 — Account & Role Verification
- Confirm demo accounts exist and load: `demo-physician@livemed.academy`, `demo-student@livemed.academy`, `demo-admin@livemed.academy`
- Log in as physician → verify redirect to `/physician-dashboard`
- Log in as student → verify redirect to `/dashboard` (not `/pending-approval`)
- Log in as admin → verify `/admin` access

### Phase 2 — Attending Workflow
- As physician: create a test course "Production Smoke Test – Internal Medicine"
- Build curriculum: add 1 system → 1 topic → 1 subtopic in `course_topics`
- Add learning unit content (quick notes, exam traps) to the subtopic
- Create a quiz with 2 questions, publish it
- Schedule a lecture with a Google Meet URL (`https://meet.google.com/test-abc-xyz`), starts in 10 min

### Phase 3 — Bulk Student Invite (NEW feature)
- As physician: invoke `physician-invite-students` with 2 test emails (`smoketest1@livemedu.test`, `smoketest2@livemedu.test`)
- Verify edge function response: `created: 2`, temp passwords returned
- Query DB to confirm: profiles created with `account_status='approved'`, `user_roles` has `student`, `course_enrollments` has `status='approved'`
- Verify `notifications` row created for each student

### Phase 4 — Student Experience
- Log in as `smoketest1` with temp password → should land on `/dashboard` immediately (no pending wall)
- Verify `/courses` shows only the test course (not all courses)
- Verify `/curriculum` shows the test course's topic tree (not generic modules)
- Verify `/virtual-classroom` shows the scheduled lecture with "Join Live Session" button
- Click into subtopic → Learning Unit page loads
- Take the quiz → submit → verify `course_quiz_attempts` row created

### Phase 5 — Physician Visibility
- Re-login as physician → verify Students tab shows the 2 invited students
- Verify quiz attempt score appears in the course analytics

### Phase 6 — Security & Production Hardening
- Run `security--run_security_scan` → confirm no critical findings
- Verify `qbank_questions` requires authentication (anon SELECT should fail)
- Verify `notifications` insert requires `auth.uid() = user_id`
- Check leaked password protection status
- Confirm `seed-demo-data` is gated (admin-only or removed from production UI)

### Phase 7 — Cleanup
- Delete test course, test students, test enrollments to leave production clean

## Bug-Fix Loop
If ANY phase fails:
1. Read logs (edge function + console + network)
2. Fix the root cause in code or DB
3. Re-run the failing phase
4. Continue forward only when green

## Final Deliverable
A signed-off checklist:
- [ ] Physician onboarding works
- [ ] Course + curriculum creation works
- [ ] Bulk invite works (with temp credentials)
- [ ] Auto-enrolled students see only their course
- [ ] Live lecture join button works
- [ ] Quiz flow end-to-end works
- [ ] Security scan clean
- [ ] No demo data leaks
- [ ] Cleanup complete

## Files Possibly Changed (only if bugs found)
None expected — but may patch:
- `supabase/functions/physician-invite-students/index.ts` (if invite fails)
- `src/pages/PhysicianDashboard.tsx` (if UI bug)
- `src/components/classroom/LectureCard.tsx` (if join button doesn't show)
- New migration (if RLS gap discovered)

## No Database Schema Changes Planned
All required tables/policies exist. Only data inserts/cleanup during testing.

