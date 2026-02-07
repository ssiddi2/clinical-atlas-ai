
# Plan: Build UWorld-Comparable QBank System

## Overview
Transform the current hardcoded question system into a robust, database-driven QBank with features that match or exceed UWorld's functionality. This will significantly enhance platform credibility and user experience.

---

## Phase 1: Database Schema for Question Bank

### 1.1 Create `qbank_questions` Table
Store comprehensive question data with USMLE metadata:

```text
┌─────────────────────────────────────────────────────────────────┐
│                       qbank_questions                           │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ question_id (text, unique) - e.g., "Q1234" for reference        │
│ stem (text) - Full clinical vignette                            │
│ options (jsonb) - Array of answer choices                       │
│ correct_answer_index (int)                                      │
│ explanation (text) - Detailed explanation with rationale        │
│ explanation_image_url (text, nullable)                          │
│ question_image_url (text, nullable)                             │
│ specialty_id (uuid, FK → specialties)                           │
│ subject (text) - e.g., "Pathophysiology", "Pharmacology"        │
│ system (text) - e.g., "Cardiovascular", "Respiratory"           │
│ topic (text) - Specific topic within system                     │
│ difficulty (enum: easy, medium, hard)                           │
│ question_type (text) - "single_best", "extended_matching"       │
│ first_aid_reference (text, nullable)                            │
│ board_yield (enum: low, medium, high)                           │
│ keywords (text[]) - For search/filtering                        │
│ is_active (boolean, default true)                               │
│ created_at, updated_at                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Create `qbank_user_progress` Table
Track individual question attempts and performance:

```text
┌─────────────────────────────────────────────────────────────────┐
│                     qbank_user_progress                         │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ user_id (uuid, FK)                                              │
│ question_id (uuid, FK → qbank_questions)                        │
│ attempt_number (int)                                            │
│ selected_answer (int)                                           │
│ is_correct (boolean)                                            │
│ time_spent_seconds (int)                                        │
│ was_flagged (boolean)                                           │
│ confidence_level (enum: guessing, unsure, confident)            │
│ session_id (uuid) - Groups questions in same test               │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Create `qbank_test_sessions` Table
Track test blocks and settings:

```text
┌─────────────────────────────────────────────────────────────────┐
│                     qbank_test_sessions                         │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ user_id (uuid, FK)                                              │
│ mode (enum: tutor, timed)                                       │
│ question_count (int)                                            │
│ time_limit_minutes (int, nullable)                              │
│ filters_applied (jsonb) - subjects, systems, difficulty, etc.   │
│ status (enum: in_progress, completed, abandoned)                │
│ started_at, completed_at                                        │
│ score_percent (decimal, nullable)                               │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Create `qbank_flagged_questions` Table
Track user-flagged questions for review:

```text
┌─────────────────────────────────────────────────────────────────┐
│                   qbank_flagged_questions                       │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ user_id (uuid, FK)                                              │
│ question_id (uuid, FK → qbank_questions)                        │
│ flag_type (enum: review_later, difficult, bookmark)             │
│ notes (text, nullable)                                          │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: QBank Interface Components

### 2.1 Create Test Configuration Page (`/qbank/create`)
Features:
- Select mode: **Tutor** (immediate feedback) or **Timed** (exam simulation)
- Filter by: Subject, System, Specialty, Difficulty
- Select question status: Unused, Incorrect, Flagged, All
- Set number of questions (10, 20, 40, or custom)
- Time limit options for timed mode

### 2.2 Create Question Interface (`/qbank/session/:id`)
UWorld-style features:
- **Clean, distraction-free interface** with dark/light mode
- **Question navigation panel** (side or bottom)
- **Timer** with pause option (tutor mode)
- **Flag/Bookmark** button for each question
- **Highlight text** in question stem (yellow highlighter)
- **Strikethrough** on answer options
- **Lab Values** quick-reference panel (collapsible)
- **Notes panel** (split-screen option)
- **Calculator** for calculations
- **Font size adjustment**

### 2.3 Create Explanation View Component
After answering (or at end for timed mode):
- Show correct answer with explanation
- Visual indicator for why each wrong answer is incorrect
- Educational content with diagrams/images
- "First Aid" reference links
- Report question button

### 2.4 Create Performance Analytics Dashboard (`/qbank/performance`)
Displays:
- Overall accuracy by subject/system
- Question usage statistics (used, unused, correct, incorrect)
- Time per question trends
- Weakness areas with recommendations
- Score prediction correlation
- Comparison to peer average (anonymized)

---

## Phase 3: Core Features Implementation

### 3.1 Tutor Mode Flow
```text
Start Test → Answer Question → Submit → 
Show Explanation Immediately → Next Question → 
Repeat → Session Complete → Show Summary
```

### 3.2 Timed Mode Flow (USMLE-Realistic)
```text
Start Test → Answer Questions (no feedback) → 
Navigate freely → Flag uncertain questions →
Time expires or Submit → 
Review All Answers with Explanations → 
Session Complete → Show Summary
```

### 3.3 Question Filtering Logic
- Filter unused questions (never attempted by user)
- Filter incorrect (previously wrong)
- Filter flagged/bookmarked
- Combine filters (e.g., unused + hard + cardiology)

### 3.4 Highlight & Strikethrough System
- Store user highlights/strikethroughs per question in session
- Persist during session, cleared on complete
- Visual feedback for cognitive processing

---

## Phase 4: Initial Question Content

### 4.1 Seed Questions Strategy
Start with 200+ high-quality questions across core subjects:

| Subject | Target Count |
|---------|--------------|
| Cardiology | 30 |
| Pulmonology | 25 |
| Gastroenterology | 25 |
| Neurology | 25 |
| Endocrinology | 25 |
| Nephrology | 20 |
| Hematology | 20 |
| Infectious Disease | 20 |
| Pharmacology | 30 |
| Pathophysiology | 30 |

### 4.2 Question Quality Standards
Each question includes:
- Clinical vignette (100-200 words)
- 5 answer options (A-E)
- Comprehensive explanation (why correct + why each is wrong)
- Difficulty rating
- High-yield tags
- Subject/System/Topic classification

---

## Phase 5: Integration with Existing Systems

### 5.1 MATCH Ready Tracker Integration
- QBank performance feeds into score prediction
- Weight recent QBank accuracy higher than older data
- Track improvement over time

### 5.2 ATLAS AI Integration
- Allow "Ask ATLAS" button on any question
- ATLAS can provide additional context/teaching
- Socratic questioning for deeper understanding

### 5.3 Curriculum Integration
- Link questions to relevant modules
- Suggest modules for weak areas
- "Practice Questions" tab within module view

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/QBank.tsx` | Main QBank dashboard/home |
| `src/pages/QBankCreate.tsx` | Test configuration page |
| `src/pages/QBankSession.tsx` | Active question-taking interface |
| `src/pages/QBankReview.tsx` | Post-test review with explanations |
| `src/pages/QBankPerformance.tsx` | Analytics dashboard |
| `src/components/qbank/QuestionCard.tsx` | Question display component |
| `src/components/qbank/AnswerOption.tsx` | Selectable answer with strikethrough |
| `src/components/qbank/QuestionNav.tsx` | Navigation sidebar |
| `src/components/qbank/ExplanationPanel.tsx` | Explanation display |
| `src/components/qbank/LabValuesPanel.tsx` | Reference lab values |
| `src/components/qbank/TestModeSelector.tsx` | Tutor vs Timed selector |
| `src/components/qbank/FilterPanel.tsx` | Subject/system/difficulty filters |
| `src/components/qbank/HighlightableText.tsx` | Text with highlight support |
| `src/components/qbank/PerformanceCharts.tsx` | Analytics visualizations |
| `src/hooks/useQBankSession.ts` | Session state management |
| `src/hooks/useQBankFilters.ts` | Filter logic |
| `supabase/functions/seed-qbank-questions/index.ts` | Initial question seeding |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add QBank routes |
| `src/pages/Dashboard.tsx` | Add QBank quick access card |
| `src/pages/Assessments.tsx` | Link to new QBank, possibly deprecate |
| `src/hooks/useScorePredictor.ts` | Integrate QBank performance data |
| `src/components/layout/Header.tsx` | Add QBank to navigation (if needed) |

---

## Database Migration Summary

```sql
-- Create ENUM types
CREATE TYPE qbank_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE qbank_mode AS ENUM ('tutor', 'timed');
CREATE TYPE qbank_session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE confidence_level AS ENUM ('guessing', 'unsure', 'confident');
CREATE TYPE flag_type AS ENUM ('review_later', 'difficult', 'bookmark');

-- Create tables with proper RLS
-- qbank_questions, qbank_user_progress, qbank_test_sessions, qbank_flagged_questions

-- Enable RLS with policies for:
-- - Users can read all questions
-- - Users can only CRUD their own progress/sessions/flags
```

---

## Summary: UWorld Feature Comparison

| Feature | UWorld | Current | After Implementation |
|---------|--------|---------|---------------------|
| Question Count | 3,600+ | ~25 | 200+ (scalable) |
| Database-driven | Yes | No | Yes |
| Tutor/Timed Modes | Yes | No | Yes |
| Question Flagging | Yes | No | Yes |
| Highlighting | Yes | No | Yes |
| Strikethrough | Yes | No | Yes |
| Lab Values Panel | Yes | No | Yes |
| Performance Analytics | Yes | Basic | Yes |
| Subject/System Filters | Yes | No | Yes |
| Split-screen Notes | Yes | No | Yes |
| Study Planner | Yes | No | Phase 2 |
| Score Correlation | Yes | Partial | Yes |

---

## Technical Notes

- All question data stored in database, not hardcoded
- RLS policies ensure users only see their own progress
- Session state persisted to allow resuming incomplete tests
- Mobile-responsive design for studying on-the-go
- Performance optimized with pagination for large question sets
- Question IDs visible (e.g., "QCARD-0042") for reference and reporting
