## Goal
When a physician invites a student (or triggers any classroom/course event), the student's bell should update in real time and clicking the notification should land them on the correct action page.

## Current state (verified)
- `notifications` table is in the `supabase_realtime` publication — `NotificationBell` already subscribes via `postgres_changes` filtered by `user_id`, so new rows arrive instantly (no 60s poll).
- The invite edge function writes a notification with `link: /courses/${courseId}`. That route (`/courses/:id`) exists and loads `CourseDetail.tsx` for the enrolled student.
- Triggers on `virtual_classrooms`, `course_materials`, `course_quizzes` fan out to `notifications` for all approved enrollees with links to `/virtual-classroom` or `/courses/:id` (both routed).
- `NotificationBell.handleClick` marks read + `navigate(n.link)` + closes the popover.

## Gaps to fix
1. **Invite deep-link is too generic.** `/courses/:id` opens the course overview but doesn't scream "you were just invited". Change the invite notification link to `/courses/${courseId}?welcome=1` and have `CourseDetail.tsx` show a one-time toast "You've been enrolled by {instructor}" when the flag is present.
2. **Navigation guard on invited students.** When a freshly-invited student clicks the bell before their session hydrates, `CourseDetail.loadData()` bounces them to `/auth`. Wait for `getSession()` (not just `getUser()`) and, if missing, redirect back to the same course URL after login instead of losing the deep link.
3. **Lecture-live notifications land on `/virtual-classroom` list.** If the payload row carries a classroom id, deep-link to `/virtual-classroom?lectureId={id}` and auto-scroll/highlight that card so "join now" is one click, not a scan.
4. **Realtime resiliency in the bell.** Add a `SUBSCRIBED` status check + one-time refetch on reconnect so a dropped socket (tab sleep, network blip) doesn't silently stop delivering.

## Out of scope
Email/push channels, dashboard "Upcoming from your instructors" strip (already listed as layer 2 in `.lovable/plan.md`).

## Files to touch
- `src/components/notifications/NotificationBell.tsx` — reconnect refetch, keep existing realtime channel.
- `src/pages/CourseDetail.tsx` — session-safe redirect, `?welcome=1` toast.
- `src/pages/VirtualClassroom.tsx` — read `?lectureId=` and scroll/highlight.
- `supabase/functions/physician-invite-students/index.ts` — append `?welcome=1` to the notification link.
- Migration: update `tg_notify_virtual_classroom` to include `?lectureId=NEW.id` in the link.
