

# Fix Curriculum Page: Show Course-Specific Topics Instead of Generic Modules

## Problem
The Curriculum page (`/curriculum`) uses the **old generic module system** (`specialties` + `modules` tables) which shows 8 pre-seeded Cardiology modules (Heart Failure: Pathophysiology, Heart Failure: Diagnosis, etc.). These are NOT the professor's actual course content.

The student's enrolled course ("USMLE Step 1 – Cardiology Mastery") has its own professor-built curriculum in `course_topics` (Myocardial Infarction → Pathophysiology, Risk Factors, Clinical Presentation, etc.) — but the Curriculum page completely ignores this.

**Result**: Student sees generic modules that don't match what the professor is teaching.

## Solution
Rewrite the Curriculum page to show **enrolled courses and their `course_topics` tree** instead of the old `specialties`/`modules` data.

### New Data Flow
1. Fetch enrolled course IDs from `course_enrollments`
2. Fetch those courses (title, description, professor name)
3. Fetch `course_topics` for those courses (the professor's actual curriculum tree)
4. Fetch `learning_unit_progress` for the student's completion tracking
5. Display courses in sidebar, topics as a tree in the main area

### UI Changes
- **Sidebar**: Lists enrolled courses (instead of specialties)
- **Main area**: Shows the selected course's topic tree (System → Topic → Subtopic) from `course_topics`
- **Leaf subtopics**: Clickable → navigate to `/courses/:courseId/topic/:topicId` (the Learning Unit page)
- **Progress**: Pulled from `learning_unit_progress` per topic instead of `user_module_progress` per module
- **Empty state**: "No courses enrolled yet" when no enrollments exist

### Old module system
The `specialties`/`modules` tables and `user_module_progress` are no longer referenced on this page. They remain in the DB for other potential uses but are not shown to students.

## Files Changed
1. **`src/pages/Curriculum.tsx`** — Rewrite data loading and rendering to use `courses` + `course_topics` + `learning_unit_progress` instead of `specialties` + `modules` + `user_module_progress`

## No Database Changes
All required tables and RLS policies already exist.

