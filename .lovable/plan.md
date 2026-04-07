
# Physician System → USMLE Training Platform Upgrade

## Phase 1: Foundation Fixes (Critical Path)

### 1A. Fix Course ↔ Lecture Connection
- Add `course_id` dropdown to CreateLectureModal (physician's courses only)
- Display lectures inside CourseDetail → Lectures tab (filter by course_id)
- Already have `course_id` column on `virtual_classrooms` — just need UI wiring

### 1B. Enable Editing (Courses + Lectures)
- Add EditCourseModal (title, description, dates, max_students, status)
- Add EditLectureModal (title, time, meeting_url, description, course_id reassignment)
- Wire edit buttons into existing card components

### 1C. Upgrade Quiz Editor
- Make AI-generated quiz questions fully editable (stem, options, correct answer, explanation)
- Allow physician to manually add questions (not just AI)
- Add delete question functionality
- Add difficulty tagging per question

## Phase 2: Curriculum & Structure

### 2A. Curriculum Builder
**New tables:**
- `course_topics` (course_id, title, sort_order, is_high_yield, parent_topic_id for subtopics)

**UI:**
- New "Curriculum" tab inside CourseDetail
- Tree view: System → Topic → Subtopic
- CRUD operations + reorder
- Link lectures/materials/quizzes to topics

### 2B. Physician Sidebar Navigation
- Replace flat PhysicianDashboard with sidebar layout
- Sections: Courses, Lectures, Students, Analytics
- Tabs inside course: Curriculum, Lectures, Materials, Quizzes, Students, Analytics

## Phase 3: Student Performance & Tracking

### 3A. Persist Quiz Attempts
**New table:**
- `course_quiz_attempts` (student_id, quiz_id, answers jsonb, score, time_taken, created_at)

**UI:**
- Student takes quiz → results saved
- Physician sees scores per student in Students tab

### 3B. Student Profile View
- Clickable student names in course roster
- Profile modal: enrolled courses, quiz scores, weak topics, attendance

### 3C. Attendance System
- Auto-mark via meeting join (placeholder — needs meeting integration)
- Manual toggle on lecture card for physician
- Attendance % calculation per student

### 3D. Performance Visualizations
- Topic heatmap (reuse existing TopicHeatmap component)
- Performance trend chart (recharts)
- Per-student analytics in physician view

## Phase 4: AI & Learning Loop

### 4A. Enhanced AI Workflow
- After material upload: AI generates MCQs + key points + flashcards
- Show in "AI Suggestions Panel" (draft state)
- Physician reviews/edits before publishing

### 4B. Learning Loop Logic
- After lecture ends → auto-assign linked quiz
- If score < 70% → flag weak areas, recommend review, assign retry
- Track improvement over attempts

### 4C. Notification Upgrades
- New lecture assigned → notify enrolled students
- Quiz published → notify
- Quiz graded / feedback → notify
- Weak area alert → notify student

## Implementation Order

**Today (Phase 1):** Fix course↔lecture link, add editing, upgrade quiz editor
**Next (Phase 2):** Curriculum builder, sidebar navigation
**Then (Phase 3):** Quiz attempts persistence, student profiles, attendance, analytics
**Finally (Phase 4):** AI enhancements, learning loop, notification upgrades

## Database Changes Needed

Phase 1: No new tables (use existing columns)
Phase 2: `course_topics` table
Phase 3: `course_quiz_attempts` table
Phase 4: No new tables (extend existing edge functions)

## Files Affected

Phase 1:
- `CreateLectureModal.tsx` — add course_id dropdown
- New: `EditCourseModal.tsx`, `EditLectureModal.tsx`
- `CourseQuizzes.tsx` — full quiz editor
- `CourseDetail.tsx` — wire lectures by course_id
- `PhysicianDashboard.tsx` — edit buttons

Phase 2:
- New: `CurriculumBuilder.tsx`
- `PhysicianDashboard.tsx` → sidebar layout
- `CourseDetail.tsx` — add Curriculum + Analytics tabs

Phase 3:
- New: `StudentProfileModal.tsx` (enhance existing)
- New: `CourseAnalytics.tsx`
- `CourseQuizzes.tsx` — save attempts
- `CourseDetail.tsx` — attendance UI

Phase 4:
- `generate-course-quiz` edge function — extend for flashcards/key points
- New: notification trigger logic in quiz/lecture flows
