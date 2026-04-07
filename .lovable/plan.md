

# Tailored Curriculum + Course System + Physician Classrooms

## Current State

- **Onboarding** collects academic info, step status, weak areas, goals — but this data is never used to personalize the student experience
- **Curriculum** has 27 modules across only 4 of 10 specialties (Cardiology, Pulmonology, Neurology, Internal Medicine). Surgery, Emergency Medicine, GI, Nephrology, Endocrinology, and Family Medicine have zero modules
- **Virtual Classroom** is lecture-based (one-off sessions), not course-based — no persistent "class" a student belongs to
- **Physicians** can only create standalone lectures, not structured courses with enrolled cohorts

## What This Plan Builds

### 1. Personalized Study Plan (uses onboarding data)
After onboarding, the student dashboard shows a **tailored learning path** based on their weak areas, step status, and goals. A new `study_plans` table stores a prioritized list of modules/specialties for each student. The onboarding edge function generates this plan at completion.

### 2. Full Course System (replaces one-off lectures)
New `courses` table where physicians create structured multi-session courses (e.g., "Cardiology Rotation Prep — 8 weeks"). Each course:
- Belongs to a specialty
- Has multiple lectures (existing `virtual_classrooms` linked via `course_id`)
- Has an enrollment roster with admission control
- Shows progress tracking per student

### 3. Physician Course Management
Physician dashboard gets a **Courses** tab alongside current Lectures:
- Create/edit courses with syllabus description, specialty, schedule
- Admit or reject student enrollment requests
- View student roster and attendance
- Attach curriculum modules to course as required reading

### 4. Student Course Enrollment
Students browse available courses, request enrollment. Physician approves. Once enrolled:
- Course appears on student dashboard with schedule
- Tailored curriculum highlights course-required modules
- Student sees their physician's lectures in order

### 5. Fill Missing Specialties
Seed modules for the 6 empty specialties (Surgery, EM, GI, Nephrology, Endocrinology, Family Medicine) — ~6 modules each, same structure as existing ones. This ensures all core rotation specialties are covered.

## Database Changes

```text
NEW TABLE: courses
  id, instructor_id, specialty_id, title, description,
  start_date, end_date, max_students, status (draft/active/completed),
  created_at, updated_at

NEW TABLE: course_enrollments
  id, course_id, student_id, status (pending/approved/rejected),
  enrolled_at, approved_at

NEW TABLE: study_plans
  id, user_id, plan_data (jsonb — ordered specialty/module priorities),
  generated_from (jsonb — snapshot of onboarding inputs),
  created_at, updated_at

ALTER: virtual_classrooms
  ADD course_id uuid NULLABLE (links lecture to a course)
```

RLS: courses visible to all authenticated, writable by instructor. Course enrollments readable by student + instructor, insertable by student, updatable by instructor. Study plans owned by user.

## UI Changes

### Physician Dashboard
- New "My Courses" section: create course, manage roster, link lectures to course
- Course detail page: student list, lecture schedule, attendance

### Student Dashboard  
- "My Study Plan" widget: prioritized specialties based on weak areas/goals
- "My Courses" section: enrolled courses with upcoming lectures
- Course catalog: browse and request enrollment

### Course Catalog Page (`/courses`)
- Browse all active courses by specialty
- Filter by specialty, physician, schedule
- Request enrollment button

## Implementation Order

1. Database migrations (4 changes above)
2. Seed ~36 new modules across 6 empty specialties
3. Build course CRUD for physicians (create, edit, roster management)
4. Build course catalog and enrollment for students
5. Generate personalized study plan from onboarding data
6. Wire study plan into student dashboard
7. Link virtual_classrooms to courses
8. Add all translation keys

## Scope Note
This is a large feature set (~15 files new/modified, 3 new tables, ~36 seed modules). Medical terminology in module content stays in English as it is internationally standardized. The approach prioritizes the physician-as-professor model where physicians own courses and control admission, which aligns with your vision of a structured medical school experience.

