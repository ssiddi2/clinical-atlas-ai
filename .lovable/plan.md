## Goal
When a physician a student is enrolled with schedules a lecture, invites them, or posts an activity, the student should find out without hunting through the app.

## Current state (verified)
- `virtual_classrooms` + `classroom_enrollments` already exist; students see lectures for courses they're enrolled in via `VirtualClassroom.tsx`.
- A `notifications` table + `NotificationBell` (polls every 60s, shows unread badge, deep-links via `link`) is already wired into `AppShell`. Nothing writes to it today for classroom events.
- Physician invites go through `physician-invite-students` edge function (email only, no in-app signal).

## Proposed awareness layers (in order of impact)

### 1. In-app notifications (primary)
Auto-insert a row into `notifications` for every enrolled student when:
- a physician **creates** a `virtual_classrooms` row → "New lecture scheduled: {title} on {date}"
- a lecture goes **live** (status → `live`) → "{title} is live now — join"
- a lecture is **edited** (time change) → "Lecture rescheduled: {title}"
- a physician **invites** a student (physician-invite-students) → "{Dr. X} invited you"
- a new **course material** or **quiz** is added to a course they're enrolled in

Implementation: Postgres triggers on `virtual_classrooms`, `course_materials`, `course_quizzes` that fan out to `notifications` for every approved enrollee. Each notification carries a `link` (e.g. `/virtual-classroom`, `/courses/{id}`) so clicking the bell jumps straight there.

Bell already polls — students see the red badge within 60s. Optionally tighten to Realtime subscription on `notifications` for instant updates.

### 2. Dashboard "Upcoming from your instructors" strip
Small card on `Dashboard.tsx` listing the next 1–3 lectures from courses the student is enrolled in, with a Join/Remind button. Uses existing `virtual_classrooms` query — no new data.

### 3. Email (secondary, for high-signal events)
Reuse Resend infra to email on: new lecture scheduled, lecture starting in 15 min, direct invite. Keep it opt-out in Profile → Notifications.

### 4. Browser push (optional, later)
Web Push for "lecture going live now." Requires service worker + subscription table. Flag as a follow-up unless you want it now.

## Technical notes
- One migration adds three `AFTER INSERT/UPDATE` triggers + a `SECURITY DEFINER` helper `notify_course_enrollees(course_id, title, message, link)` that inserts N rows into `notifications`.
- Switch `NotificationBell` from 60s polling to a Realtime channel on `notifications` filtered by `user_id` for instant delivery.
- Physician invite edge function also inserts a notification row (not just email) when the invitee already has an account.

## Scope question
Want me to build layers **1 + 2** now (biggest UX win, no new infra), and defer email + push? Or include email in this pass?
