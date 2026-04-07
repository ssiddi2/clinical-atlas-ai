

# Multi-Role Platform + Virtual Classroom + Bug Fixes

## Overview

This plan adds three major capabilities: (1) separate login flows for teaching attendings and medical students, (2) a virtual classroom system for live lectures, and (3) fixes the existing build error and duplicate flag UI bug.

## Bug Fixes (Immediate)

### Fix 1: QuestionNav.tsx build error
The component imports `useTranslation` but never destructures `t` from it. Add `const { t } = useTranslation();` inside the component body after the existing destructured props.

### Fix 2: Duplicate flags in LanguageSwitcher
The trigger renders `{current?.flag}` manually AND `<SelectValue />` renders the selected item's content (which also contains the flag). Fix: remove the manual `{current?.flag}` span from the trigger, and make `SelectValue` show only the language code/name, OR remove `SelectValue` and only show the flag.

## Feature 1: Role-Based Login (Teaching Attending + Medical Student)

### Database
The `app_role` enum already includes `physician` and `faculty` -- no schema changes needed. The `profiles` table already has all necessary fields.

### Auth Page Changes (`src/pages/Auth.tsx`)
- Add a role selector on the signup form: "I am a Medical Student" / "I am a Teaching Attending/Physician"
- When signing up as physician, store role metadata so `handle_new_user` trigger assigns `physician` role instead of `student`
- Update the `handle_new_user` database function to read a `role` field from `raw_user_meta_data` and assign accordingly
- After login, route physicians to a physician-specific dashboard

### New Page: Physician Dashboard (`src/pages/PhysicianDashboard.tsx`)
- Overview of scheduled lectures and upcoming virtual rounds
- Student roster for their classes
- Ability to create/schedule virtual classroom sessions
- Quick access to write LOR recommendations

### Routing Logic
- After auth, check `user_roles` table -- if role is `physician`, redirect to `/physician-dashboard`; if `student`, redirect to existing `/dashboard`
- Add route in `App.tsx`: `/physician-dashboard`

## Feature 2: Virtual Classroom (`src/pages/VirtualClassroom.tsx`)

### Database Migration
New table: `virtual_classrooms`
```text
id              UUID PK
instructor_id   UUID (references auth.users)
title           TEXT
description     TEXT
specialty_id    UUID (references specialties)
scheduled_start TIMESTAMPTZ
scheduled_end   TIMESTAMPTZ
max_students    INT DEFAULT 50
meeting_url     TEXT
recording_url   TEXT (nullable, for replay)
status          TEXT DEFAULT 'scheduled' (scheduled/live/completed/cancelled)
created_at      TIMESTAMPTZ DEFAULT now()
```

New table: `classroom_enrollments`
```text
id              UUID PK
classroom_id    UUID (references virtual_classrooms)
student_id      UUID (references auth.users)
enrolled_at     TIMESTAMPTZ DEFAULT now()
attended        BOOLEAN DEFAULT false
```

RLS: Instructors can CRUD their own classrooms. Students can view/enroll in any classroom. Admins can manage all.

### Physician Side
- "Create Lecture" form: title, description, specialty, date/time, max students, meeting link
- "My Lectures" list with status indicators (upcoming, live, completed)
- Student enrollment count per lecture

### Student Side
- Browse available lectures by specialty/date
- Enroll in upcoming lectures
- View enrolled lectures on dashboard
- Join button that opens the meeting URL

### Pages and Components
| File | Purpose |
|------|---------|
| `src/pages/VirtualClassroom.tsx` | Student view - browse & enroll in lectures |
| `src/pages/PhysicianDashboard.tsx` | Physician hub - manage lectures, rounds, LORs |
| `src/components/classroom/CreateLectureModal.tsx` | Form to create/edit a lecture |
| `src/components/classroom/LectureCard.tsx` | Display card for a lecture with enroll/join |
| `src/components/classroom/LectureList.tsx` | Filterable list of lectures |

### Dashboard Integration
- Add "Upcoming Lectures" widget to student Dashboard
- Add nav item "Virtual Classroom" in authenticated sidebar/nav

## Feature 3: i18n for New Features
All new UI strings will use `t()` calls with keys added to `en.json`, `ar.json`, `ur.json`, and `es.json`.

## Implementation Order

1. Fix QuestionNav.tsx build error (add `const { t } = useTranslation()`)
2. Fix LanguageSwitcher duplicate flag
3. Update `handle_new_user` trigger to support role from metadata
4. Update Auth.tsx with role selector on signup
5. Create `virtual_classrooms` and `classroom_enrollments` tables with RLS
6. Build PhysicianDashboard page with lecture management
7. Build VirtualClassroom page for students
8. Add routes and post-login routing logic
9. Add translation keys for all new strings
10. Wire up nav items and dashboard widgets

## Technical Notes

- The meeting URL field is a simple text link (Zoom, Google Meet, etc.) -- not a built-in video solution. Physicians paste their meeting link.
- The `handle_new_user` trigger needs a migration to check `raw_user_meta_data->>'signup_role'` and assign the correct `app_role`.
- No new edge functions needed -- all CRUD goes through Supabase client with RLS.

