## Root cause

- The `courses` SELECT policy only exposes rows with `status = 'published'`. The invited course is `status = 'active'`, so the student's query returns `[]` and `CourseDetail` renders the "Course unavailable" fallback — even though the invitation exists.
- The `NotificationBell` popup renders every notification with the same generic row (title/message/timeAgo). There is no inline Accept/Decline for course-invitation notifications, so the only path is clicking through — which currently dead-ends on the RLS issue above.

## Fix

1. **RLS: let invited/enrolled students see the course row**
   Replace the current `courses` SELECT policy with one that also allows visibility when the viewer has any `course_enrollments` row (any status incl. `invited`, `approved`, `pending`) for that course. Keep published + owner + admin. Also treat non-draft statuses (`published`, `active`) as public so active courses show up in listings — matches what the app already assumes.

2. **CourseDetail: fix inconsistent status handling**
   The "Course unavailable" branch will stop firing once RLS is corrected. Confirm the existing `?invite=1` accept/decline banner still renders for `status='invited'` enrollments and shows a clear CTA at the top.

3. **NotificationBell: inline Accept / Decline for invitations**
   In `src/components/notifications/NotificationBell.tsx`, detect invitation notifications (link contains `invite=1` or title starts with `Course invitation:`) and render two buttons in the popover row:
   - **Accept** → update the matching `course_enrollments` row from `invited` → `approved`, mark the notification read, toast success, navigate to the course.
   - **Decline** → update to `declined`, mark read, toast, stay on page.
   Both actions locate the enrollment by `(student_id = me, course_id parsed from link, status = 'invited')`. Realtime already refreshes the AppShell badge, Invitations page, and instructor roster; the existing DB trigger `tg_notify_instructor_on_invite_response` will notify the professor.

4. **Guard against future breakage**
   Add a small helper in the bell to parse the course id from the link so we don't hardcode routes elsewhere.

## Technical details

- Migration: drop and recreate the `courses` SELECT policy:
  ```sql
  DROP POLICY "Published courses visible; drafts only to owner/admin" ON public.courses;
  CREATE POLICY "Courses visible to public, owner, admin, or enrollees"
    ON public.courses FOR SELECT
    USING (
      status IN ('published','active')
      OR auth.uid() = instructor_id
      OR public.has_role(auth.uid(), 'platform_admin')
      OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        WHERE ce.course_id = courses.id
          AND ce.student_id = auth.uid()
          AND ce.status IN ('invited','approved','pending')
      )
    );
  ```
- No schema changes; policies only.
- `NotificationBell` gets two new async handlers (`acceptInvite`, `declineInvite`) using the existing `supabase` client — no new deps.

## Out of scope

- Redesigning the notifications table (no new `type` values needed; detection is link/title-based and backward-compatible).
- Changes to `physician-invite-students` — invite flow itself is working.
