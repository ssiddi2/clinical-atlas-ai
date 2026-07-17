
## Scope

Extend the existing course invitation flow (`course_enrollments.status = 'invited'`) with resend, revoke, a student-facing pending-invitations page, realtime sync, and a shared audit log visible to teachers, students, and admins.

## 1. Database changes (single migration)

**New table `public.enrollment_audit_log`**
- `enrollment_id uuid` (nullable — kept after enrollment delete via `ON DELETE SET NULL`)
- `course_id uuid not null`
- `student_id uuid not null`
- `actor_id uuid` (who performed the action — instructor/student/admin/system)
- `action text not null` — one of: `invited`, `resent`, `revoked`, `accepted`, `declined`, `approved`, `rejected`, `enrolled_by_admin`, `removed`
- `previous_status text`, `new_status text`
- `metadata jsonb` (invite link, notification id, notes)
- `created_at timestamptz default now()`
- GRANTs to `authenticated` (SELECT) and `service_role` (ALL). No anon.
- RLS: student can SELECT rows where `student_id = auth.uid()`; course instructor can SELECT rows for their course (via `is_course_instructor`); platform_admin can SELECT all. INSERTs go through triggers / edge function (service role), so no INSERT policy for `authenticated`.

**Triggers on `course_enrollments`**
- `AFTER INSERT`: log `invited` / `enrolled_by_admin` (based on status).
- `AFTER UPDATE OF status`: log the transition (`accepted`, `declined`, `approved`, `rejected`, `revoked`) using `previous_status` → `new_status`. `actor_id := auth.uid()`.
- `AFTER DELETE`: log `removed`.

**RLS additions on `course_enrollments`**
- Allow instructor to UPDATE status → `revoked` on their own course rows where current status is `invited`.
- Allow instructor to DELETE an `invited` row (revoke = delete option — see decision below; we will pick UPDATE-to-revoked so history is preserved).
- Existing student self-accept/decline policy stays.

**Realtime**
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.course_enrollments;`
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_audit_log;`

## 2. Edge function: `physician-invite-students`

Extend to support three modes via request body `action`:
- `invite` (existing): unchanged behavior, now also relies on triggers for audit rows.
- `resend`: for each `userId`, require an existing `invited` enrollment. Refresh `updated_at`, re-insert a notification with the same `/courses/:id?invite=1` link, and insert an audit row with `action='resent'`. No-op with a clear response if the student already accepted/declined.
- `revoke`: instructor-only. Update enrollment `status='revoked'`, insert a notification to the student ("Your invitation to X was withdrawn"), audit row via trigger.

Auth check: caller must be the course instructor (or platform_admin).

## 3. Student portal: pending invitations page

- New route `/invitations` → `src/pages/Invitations.tsx`, wrapped in `AppShell`.
- Query: `course_enrollments` where `student_id = auth.uid()` and `status = 'invited'`, joined with `courses` (title, description, instructor name via profiles).
- Each row: course card + Accept / Decline buttons reusing the same update logic as `CourseDetail`.
- Empty state with link back to Dashboard / Browse Courses.
- Add a Dashboard tile ("Pending invitations · N") and a link in `AppShell` user menu.
- Subscribe to realtime `course_enrollments` changes filtered by `student_id` to remove rows on accept/decline/revoke without reload.

## 4. Realtime sync on existing pages

- **`CourseDetail.tsx` (roster tab)**: subscribe to `course_enrollments` changes for this `course_id` and re-run `loadData()` (or splice the payload). Also refresh audit log tab.
- **`CourseDetail.tsx` (student view)**: subscribe filtered by `student_id` so the Accept/Decline banner disappears if the invite is revoked by the instructor.
- **`NotificationBell`**: already realtime — no change needed beyond ensuring the resend/revoke notifications land in `notifications`.

## 5. Roster UI: resend & revoke controls

In `CourseDetail.tsx` Students tab, add a new "Invited" section (status `invited`) alongside Pending/Approved:
- Row shows student name + invited timestamp.
- Buttons: **Resend invitation** and **Revoke** (both call `physician-invite-students` with the new actions).
- Confirmation dialog on Revoke.

## 6. Audit log UI

Shared component `src/components/courses/EnrollmentAuditLog.tsx` used in three places:
- **Course roster** (instructor + admin): new "Activity" tab in `CourseDetail.tsx` filtered by `course_id`. Shows all invite/accept/decline/revoke/enroll events across every student.
- **Student invitations page & CourseDetail student view**: same component, filtered by `course_id AND student_id = auth.uid()`, showing only the current student's history for that course.
- **Admin panel**: new sub-tab in `Admin.tsx` → Courses section, showing the log globally with course + student filters.

Each row: icon per action, "Actor performed Action on Student in Course", relative timestamp with absolute tooltip.

## 7. Decisions to confirm

1. Revoke = keep the enrollment row with `status='revoked'` (better audit trail). If instructor later invites again, we flip it back to `invited`. Confirm this over hard-delete.
2. Resend cooldown: allow unlimited manual resends, or throttle to once per hour per student? Default proposed: no cooldown, but skip if last resend was < 60s ago (prevents accidental double-clicks).
3. Audit log retention: keep indefinitely (recommended) unless you want a 12-month TTL.

## Technical notes

- All new writes to `enrollment_audit_log` happen via `SECURITY DEFINER` triggers or the edge function using the service role — no direct client insert path.
- Notifications for resend/revoke use `type='info'` / `type='warning'` and link to `/courses/:id?invite=1` (resend) or `/dashboard` (revoke).
- Types regenerate after migration; then wire UI.

## Deliverables

```text
supabase/migrations/<ts>_invitation_lifecycle.sql   # table, triggers, RLS, realtime
supabase/functions/physician-invite-students/       # add resend/revoke actions
src/pages/Invitations.tsx                            # new page + route
src/components/courses/EnrollmentAuditLog.tsx        # shared audit UI
src/pages/CourseDetail.tsx                           # invited section, resend/revoke, activity tab, realtime
src/pages/Dashboard.tsx                              # pending-invitations tile
src/components/layout/AppShell.tsx                   # nav entry
src/pages/Admin.tsx                                  # global audit view
```
