

# Admin Dashboard Upgrade: Role-Based Views, Course Oversight, and Enrollment Management

## Problem
The admin dashboard currently shows all users in a single flat list with no distinction between students and professors. There is no visibility into courses, enrollments, or which student belongs to which professor's course. Admin cannot assign/remove students from courses.

## Solution

### 1. Tabbed Admin Layout
Replace the current single-page layout with a tabbed interface:
- **Overview** (existing stats + pending approvals)
- **Professors** (list of physician/faculty users with their courses)
- **Students** (list of student users with their enrollments)
- **Courses** (all courses with enrollment details, admin can manage)
- **Applications** (existing)
- **Verifications** (existing)

### 2. Professors Tab (New Component: `AdminProfessors.tsx`)
- List all users with `physician` or `faculty` role
- For each professor show: name, status, number of courses, total enrolled students
- Expandable row showing their courses with student count per course
- Click course name to jump to Course detail in Courses tab

### 3. Students Tab (New Component: `AdminStudents.tsx`)
- List all users with `student` role
- Show: name, status, enrolled courses count
- Expandable row showing which courses they are enrolled in and the professor name
- Quick actions: activate/deactivate account

### 4. Courses Tab (New Component: `AdminCourses.tsx`)
- List all courses with: title, professor name, enrolled student count, status
- Expandable course detail showing:
  - Full student roster with enrollment status (pending/approved)
  - Admin can **approve/reject** pending enrollments
  - Admin can **remove** a student from a course (delete enrollment)
  - Admin can **add** a student to a course (insert enrollment with status "approved")
- "Add Student" button opens a dropdown of approved students not yet in the course

### 5. Data Loading
The `loadData` function in `Admin.tsx` will additionally fetch:
- `user_roles` table to identify professors vs students
- `courses` table (all courses visible to admin via existing RLS)
- `course_enrollments` table (all enrollments visible to admin via existing RLS)

No database changes needed -- all tables already have admin RLS policies granting full access.

### 6. Admin Enrollment Actions
For add/remove student operations, use direct Supabase client calls since admin RLS policies already grant ALL access on `course_enrollments`.

## Files Changed
1. **`src/pages/Admin.tsx`** -- Add Tabs UI, fetch roles/courses/enrollments, pass data to new components
2. **`src/components/admin/AdminProfessors.tsx`** -- New: professor list with course breakdown
3. **`src/components/admin/AdminStudents.tsx`** -- New: student list with enrollment info
4. **`src/components/admin/AdminCourses.tsx`** -- New: course list with full roster management (add/remove students, approve enrollments)
5. **`src/components/admin/AdminStats.tsx`** -- Add professor/student/course counts
6. **`src/components/admin/UserManagement.tsx`** -- Minor: add role badge (student vs professor)

## No Database Changes
All required RLS policies already exist:
- `course_enrollments`: "Admins can manage all enrollments" (ALL)
- `courses`: "Admins can manage all courses" (ALL)
- `user_roles`: "Platform admins can manage roles" (ALL)

