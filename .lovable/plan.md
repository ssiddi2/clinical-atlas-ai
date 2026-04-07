
# Subtopic → Learning Unit Upgrade

## Overview
Transform each curriculum subtopic (leaf node in `course_topics`) into a full "Learning Unit" — a dedicated page where physicians control all teaching content, assessments, and student progression.

## Database Changes

### New table: `learning_unit_content`
Stores rich content per topic: explanation, quick notes, exam traps, instructor notes, flow control settings (passing score, gating, retry rules).

### New table: `learning_unit_questions`
Per-topic MCQs with difficulty, concept tag, and exam relevance — separate from course-level quizzes for granular topic control.

### New table: `learning_unit_progress`
Per-student, per-topic tracking: quiz score, completion status, attempts, time spent.

All three tables get RLS: instructors CRUD, enrolled students read + update own progress, admins full access.

## New Route & Page
`/courses/:courseId/topic/:topicId` → **LearningUnitPage** with 7 tabs:
1. **Overview** — Explanation editor, Quick Notes, Exam Traps, Instructor Note, toggle High Yield / Important / Exam Focus
2. **Lecture** — Lectures linked to this topic, create or link existing
3. **Materials** — Reuses existing CourseMaterials filtered by topic_id
4. **Questions** — Full MCQ editor (create/edit/delete), difficulty + concept tags, "Generate with AI" button
5. **Student Performance** — Completion tracking, scores, struggling students, send reminders
6. **AI Assistant** — ATLAS chat scoped to topic
7. **Settings** — Passing score, require quiz before next topic, retry rules

## AI Generation (Controlled)
"Generate with AI" inside Questions tab calls the edge function with topic context. Returns explanation draft + MCQs + quick notes + exam traps in a **review panel** — physician must Approve, Edit, or Reject each item before anything is saved. Nothing auto-publishes.

## Learning Flow Control
- Physician sets passing score per unit and can require quiz completion before next topic unlocks
- Student-facing: locked topics show lock icon in curriculum tree
- Failed attempts can trigger retry with different questions

## CurriculumBuilder Update
- Leaf subtopics become clickable → navigate to Learning Unit page
- Visual indicators for content status (empty vs populated)
- Existing CRUD preserved

## Implementation Order
1. Database migration (3 tables + RLS)
2. LearningUnitPage with Overview + Settings tabs
3. LearningUnitQuestions — MCQ editor + quiz-taking
4. LearningUnitProgress — student tracking table
5. AIGenerationPanel — AI content generation with review workflow
6. Update CurriculumBuilder — clickable subtopics + lock indicators
7. Extend generate-course-quiz edge function for topic-level generation
8. Add route in App.tsx + wire student progress
