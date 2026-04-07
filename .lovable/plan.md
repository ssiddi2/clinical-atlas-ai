
# Subtopic → Learning Unit Upgrade

## Overview
Transform each curriculum subtopic (leaf node in `course_topics`) into a full "Learning Unit" — a dedicated page where physicians control all teaching content, assessments, and student progression.

## Database Changes

### New table: `learning_unit_content`
Stores the rich content for each topic (explanation, quick notes, exam traps, instructor notes).

```sql
CREATE TABLE learning_unit_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
  explanation text DEFAULT '',
  quick_notes text DEFAULT '',
  exam_traps text DEFAULT '',
  instructor_note text DEFAULT '',
  is_high_yield boolean DEFAULT false,
  is_important boolean DEFAULT false,
  is_exam_focus boolean DEFAULT false,
  status text DEFAULT 'draft',
  passing_score integer DEFAULT 70,
  require_quiz_before_next boolean DEFAULT false,
  allow_retry boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(topic_id)
);
```

### New table: `learning_unit_questions`
Per-topic MCQs (separate from course_quizzes for topic-level granularity).

```sql
CREATE TABLE learning_unit_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
  stem text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer_index integer NOT NULL DEFAULT 0,
  explanation text DEFAULT '',
  difficulty text DEFAULT 'medium',
  concept_tag text DEFAULT '',
  exam_relevance text DEFAULT 'medium',
  created_by uuid NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### New table: `learning_unit_progress`
Per-student, per-topic progress tracking.

```sql
CREATE TABLE learning_unit_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  topic_id uuid NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
  quiz_score integer,
  quiz_answers jsonb DEFAULT '[]',
  time_spent_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, topic_id)
);
```

RLS for all three tables: instructors (via course_topics → courses) get full CRUD; enrolled students get SELECT + INSERT/UPDATE on their own progress rows. Admins get ALL.

### Extend existing tables
- `course_materials`: already has `topic_id` — will use it to filter materials per learning unit
- `virtual_classrooms`: already has `topic_id` — will use it to link lectures per learning unit

## New Route
`/courses/:courseId/topic/:topicId` → `LearningUnitPage.tsx`

## New Components

### 1. `LearningUnitPage.tsx` (~400 lines)
Full-page view with 7 tabs:
- **Overview**: Explanation editor (textarea with markdown preview for now, rich text later), Quick Notes, Exam Traps, Instructor Note, High Yield / Important / Exam Focus toggles
- **Lecture**: List lectures linked to this topic (from `virtual_classrooms` where `topic_id` matches), create new or link existing
- **Materials**: Reuse `CourseMaterials` filtered by `topic_id`
- **Questions**: CRUD for `learning_unit_questions` — full editor with difficulty, concept tag, exam relevance. "Generate with AI" button
- **Student Performance**: Show `learning_unit_progress` — who completed, avg score, struggling students, time spent
- **AI Assistant**: ATLAS chat scoped to this topic
- **Settings**: Passing score, require quiz before next, retry rules

### 2. `LearningUnitQuestions.tsx` (~250 lines)
Full MCQ editor similar to existing `CourseQuizzes` editor but for per-topic questions:
- Create/edit/delete questions
- Tag with difficulty, concept, exam relevance
- "Generate with AI" button → calls edge function → shows review panel (approve/edit/reject each question)

### 3. `LearningUnitProgress.tsx` (~150 lines)
Table showing per-student progress for this topic: score, completion status, attempts, time spent. Physician can send reminder notification or assign extra questions.

### 4. `AIGenerationPanel.tsx` (~200 lines)
When physician clicks "Generate with AI":
- Calls `generate-course-quiz` edge function (extended) with `topic_id` and `generation_type` param
- Returns: explanation draft, MCQs, quick summary, exam traps
- Shows in a review panel with Approve / Edit / Reject per item
- Nothing auto-publishes

## Edge Function Update: `generate-course-quiz`
Add support for `topic_id` and `generation_type: "learning_unit"` parameter. When provided:
- Generate explanation text, 5-10 MCQs, quick notes summary, and exam traps
- Return structured JSON for review panel

## UI Changes

### CurriculumBuilder.tsx
- Make leaf-level subtopics clickable → navigate to `/courses/${courseId}/topic/${topicId}`
- Add visual indicator (icon) showing if a learning unit has content vs empty
- Keep existing CRUD (add/edit/delete/reorder/high-yield toggle)

### CourseDetail.tsx
- No structural changes needed — Curriculum tab stays as-is

### App.tsx
- Add route: `/courses/:courseId/topic/:topicId` → `LearningUnitPage`

## Learning Flow Logic
- `learning_unit_content.require_quiz_before_next` controls gating
- Student-facing: when viewing curriculum tree, locked topics show a lock icon
- Check: student has `learning_unit_progress.completed = true` for prerequisite topic (previous sibling by `sort_order`)
- Physician sets passing score per unit; student must score >= threshold to mark completed

## Implementation Order
1. Database migration (3 new tables + RLS)
2. `LearningUnitPage.tsx` with Overview + Settings tabs
3. `LearningUnitQuestions.tsx` — MCQ editor + quiz-taking
4. `LearningUnitProgress.tsx` — student tracking
5. `AIGenerationPanel.tsx` — AI content generation with review
6. Update `CurriculumBuilder.tsx` — make subtopics clickable + lock indicators
7. Update `generate-course-quiz` edge function for topic-level generation
8. Add route in `App.tsx`
9. Wire student quiz attempts into `learning_unit_progress`

## Scope Note
- Rich text editor: uses textarea + markdown for v1 (avoids heavy dependency). Can upgrade to TipTap later.
- Drag-and-drop reorder for questions uses manual sort_order buttons for v1.
- Attendance auto-marking is out of scope for this change (requires meeting integration).
- All new tables get proper RLS. No changes to existing tables' structure.
