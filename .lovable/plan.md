

# Student ↔ Physician Connectivity Audit — Dead Ends Found

## How They Connect Today

The core connection works: **Physician creates lecture → Student sees it in Virtual Classroom → Student enrolls → Both see meeting URL**. Auth routing correctly sends physicians to `/physician-dashboard` and students to `/dashboard`. The `virtual_classrooms` and `classroom_enrollments` tables with RLS policies enable this flow.

## Dead Ends and Issues Found

### 1. **Student Dashboard has NO link to Virtual Classroom**
The student dashboard nav links go to: Curriculum, ATLAS, Virtual Rounds, Assessments. There is **no link to `/virtual-classroom`** anywhere in the student dashboard or nav. Students can only reach it by typing the URL manually. This is a major dead end.

**Fix**: Add a "Virtual Classroom" quick action and nav link on the student Dashboard.

### 2. **Physician "Write LOR" card is a dead end**
In `PhysicianDashboard.tsx` line 206, the "Write LOR" quick action card has no `onClick` handler and no `href`. It's completely non-functional — clicking it does nothing.

**Fix**: Either build a simple LOR form page, or link it to a placeholder page, or add a "coming soon" toast on click.

### 3. **Physician can't see enrollment counts**
The `PhysicianDashboard` loads lectures via `virtual_classrooms` but never queries `classroom_enrollments` to get how many students enrolled. The `LectureCard` component supports an `enrollmentCount` prop, but the physician dashboard never passes it. The "Total Students" stat card (line 115) just sums `max_students` — which is the capacity, not actual enrollments.

**Fix**: Query `classroom_enrollments` grouped by `classroom_id` and pass counts to each `LectureCard`. Fix the "Total Students" stat to show actual enrolled count.

### 4. **Physician "Settings" and "Notifications" buttons are dead ends**
Lines 86-87: Bell and Settings icon buttons have no `onClick` or navigation. They render but do nothing.

**Fix**: Wire Settings to `/profile` and add a toast for notifications (or build a notification system).

### 5. **Student "Upcoming" sidebar items are hardcoded, not real data**
Dashboard lines 88-92: The "Upcoming" items (Cardiology Module Review, Live Rounds, etc.) are hardcoded static data, not pulled from the database. They don't reflect actual enrolled lectures or scheduled sessions.

**Fix**: Query the student's `classroom_enrollments` joined with `virtual_classrooms` to show real upcoming lectures.

### 6. **Student "Continue Learning" card is hardcoded**
Dashboard lines 209-219: The "Cardiology: Heart Failure Management" card is static/fake data. Not a connectivity issue per se, but it's a dead end since clicking "Resume" does nothing meaningful.

### 7. **Physician doesn't bypass pending approval / onboarding check**
In `Auth.tsx` lines 42-65, physicians go through the same `account_status` check as students. If a physician's account is `pending_approval` (the default), they get stuck at `/pending-approval` and never reach their dashboard. The demo physician account was manually set to `approved`, but any new physician signup will hit this wall.

**Fix**: Either auto-approve physician accounts in the `handle_new_user` trigger, or build a physician-specific approval flow, or skip the pending check for physicians.

### 8. **Physician has no access to student roster per lecture**
The physician dashboard mentions "student roster" in the plan but it was never built. There's no way for a physician to see which students enrolled in their lecture — only the enrollment count (which itself isn't even wired, per issue #3).

**Fix**: Add an expandable student list on each `LectureCard` when `isInstructor` is true.

## Summary of Dead Ends

| # | Issue | Severity | Where |
|---|-------|----------|-------|
| 1 | No Virtual Classroom link for students | **High** | Dashboard nav/quick actions |
| 2 | "Write LOR" card does nothing | **Medium** | PhysicianDashboard line 206 |
| 3 | Enrollment counts not shown to physician | **Medium** | PhysicianDashboard + LectureCard |
| 4 | Settings/Notifications buttons dead | **Low** | PhysicianDashboard lines 86-87 |
| 5 | Student upcoming items are fake/static | **Medium** | Dashboard lines 88-92 |
| 6 | "Continue Learning" card is static | **Low** | Dashboard lines 209-219 |
| 7 | New physician signups stuck at pending approval | **High** | Auth.tsx routing logic |
| 8 | No student roster view for physicians | **Medium** | PhysicianDashboard |

## Proposed Implementation

### Step 1: Fix critical routing (issue #7)
Update `Auth.tsx` to skip `pending_approval` check for physicians, or auto-approve them in the trigger.

### Step 2: Add Virtual Classroom link to student dashboard (issue #1)
Add nav link and quick action card pointing to `/virtual-classroom`.

### Step 3: Wire enrollment counts for physicians (issue #3)
Query `classroom_enrollments` in `PhysicianDashboard`, pass counts to `LectureCard`, fix "Total Students" stat.

### Step 4: Fix LOR dead end (issue #2)
Add "Coming Soon" toast on click for now.

### Step 5: Wire physician Settings/Notifications (issue #4)
Point Settings to `/profile`, add placeholder toast for notifications.

### Step 6: Show real upcoming lectures on student dashboard (issue #5)
Replace hardcoded items with actual enrolled lectures from DB.

### Step 7: Add student roster to physician lecture cards (issue #8)
Show enrolled student names when physician expands a lecture card.

No database changes needed — all tables and RLS policies already support these fixes. This is purely frontend wiring work.

