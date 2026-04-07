

# Fix Student Views: Show Only Enrolled Course Content

## Problem
Students see ALL content across the platform instead of only content related to their enrolled courses:
1. **Courses page** shows all active courses (catalog browse) -- should show only enrolled courses as "My Courses"
2. **Virtual Classroom** shows ALL lectures from all professors -- should only show lectures linked to enrolled courses
3. **Dashboard "Upcoming"** falls back to hardcoded items and shows hardcoded progress data
4. **Dashboard "Continue Learning"** is completely hardcoded (Cardiology: Heart Failure)
5. **Dashboard progress** shows static fake data (Cardiology 78%, Pulmonology 65%, etc.)
6. **Curriculum page** shows all modules from all specialties -- not filtered to enrolled courses
7. **Assessments page** uses hardcoded sample questions, not tied to course content

## Solution

### 1. Courses Page → "My Courses" (enrolled only)
- Change query from fetching ALL active courses to only courses where student has an approved enrollment
- Join `course_enrollments` to `courses` filtered by `student_id` and `status = 'approved'`
- Update page title from "Course Catalog" to "My Courses"
- Remove specialty filter (irrelevant when showing only enrolled)
- Keep search

### 2. Virtual Classroom → Only lectures from enrolled courses
- Instead of fetching ALL `virtual_classrooms`, filter by `course_id IN (student's enrolled course IDs)`
- First fetch enrolled course IDs, then filter classrooms by those course IDs
- Remove "All Lectures" tab, default to showing only relevant lectures

### 3. Dashboard — Replace all hardcoded content
- **Upcoming section**: Remove hardcoded fallback items; if no enrolled lectures exist, show "No upcoming sessions" message
- **Continue Learning**: Fetch the student's most recent `learning_unit_progress` or `user_module_progress` record and display actual course/topic info instead of hardcoded "Cardiology: Heart Failure"
- **Progress section**: Fetch actual enrolled courses and compute progress from `learning_unit_progress` per course instead of static `progressData` array

### 4. Curriculum Page → Filter to enrolled course specialties
- Only show specialties and modules that belong to courses the student is enrolled in
- Alternatively, keep curriculum as-is since it's a general learning resource, but this depends on intent -- the plan will filter it to enrolled course topics

### 5. Quick Actions cleanup
- Remove "Browse Courses" from quick actions or rename to "My Courses"
- Keep other actions that are generally useful (ATLAS, Assessments, etc.)

## Files Changed
1. **`src/pages/Courses.tsx`** — Filter to enrolled courses only, update title
2. **`src/pages/VirtualClassroom.tsx`** — Filter lectures to enrolled course IDs only
3. **`src/pages/Dashboard.tsx`** — Replace hardcoded continue learning, progress, and upcoming fallback with real DB queries
4. **`src/pages/Curriculum.tsx`** — Filter modules to enrolled course specialties

## No Database Changes
All filtering uses existing tables and RLS policies.

