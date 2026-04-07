

# Enhanced Platform: Content Management, AI Test Generation, and Notifications

## Current State

- **Student flow**: Apply Now form → Admin reviews → Admin creates account → Student onboards → Student browses courses & enrolls
- **Physician flow**: Admin creates physician account → Physician creates courses & lectures (title, description, schedule, meeting URL only)
- **Admin flow**: View applications, approve/reject accounts, verify documents, create users

## Gaps Identified

1. **Physicians cannot upload content** — no file uploads (PDFs, notes, slides) attached to courses
2. **No AI-generated tests from course content** — ATLAS exists for chat but doesn't generate course-specific quizzes
3. **No notification system** — students don't know when a physician uploads content or creates a lecture
4. **Admin cannot activate/deactivate accounts** — only approve/reject during initial signup; no toggle for existing accounts
5. **Physician cannot see enrolled student details** — roster exists but is minimal

## What This Plan Builds

### 1. Course Content Uploads (Physician)
Physicians can upload PDFs, Word docs, notes, and slides to their courses. Each upload is stored in a new `course-materials` storage bucket and tracked in a `course_materials` table.

**Physician UI**: New "Materials" tab on course detail page with drag-and-drop file upload, file list with download/delete, and material type labels (notes, slides, syllabus, assignment).

### 2. AI-Generated Tests from Course Content (Physician)
Physicians click "Generate Quiz" on a course. An edge function reads the course materials text, sends it to Lovable AI (Gemini Flash), and returns structured MCQ questions. The physician can review, edit, and publish the quiz.

**New table**: `course_quizzes` (course_id, title, questions jsonb, created_by, status)
**New edge function**: `generate-course-quiz` — extracts text from uploaded materials, prompts AI to generate 10-20 MCQs, returns structured JSON

### 3. In-App Notifications
A `notifications` table stores alerts. Students get notified when:
- A physician uploads new material to an enrolled course
- A new lecture is scheduled for an enrolled course
- Their enrollment is approved/rejected

Physicians get notified when a student requests enrollment.

**UI**: Bell icon badge count in header, dropdown notification panel, mark-as-read.

### 4. Admin Account Management
Add activate/deactivate toggle for any user account from the admin dashboard. Currently admin can only approve pending accounts — this adds the ability to suspend and reactivate existing approved accounts.

### 5. Physician Student Roster Enhancement
Show enrolled student count, names, and enrollment status on physician's course page. Add ability to view student profiles.

## Database Changes

```text
NEW TABLE: course_materials
  id, course_id, uploaded_by, file_name, file_url, file_type,
  material_type (notes/slides/syllabus/assignment/other),
  description, created_at

NEW TABLE: course_quizzes
  id, course_id, title, questions (jsonb),
  created_by, status (draft/published), created_at, updated_at

NEW TABLE: notifications
  id, user_id, type, title, message, link,
  is_read, created_at

NEW STORAGE BUCKET: course-materials (private)
```

RLS:
- `course_materials`: instructor can CRUD own course materials; enrolled students can SELECT
- `course_quizzes`: instructor CRUD; enrolled students SELECT published only
- `notifications`: users can read/update their own only
- `course-materials` bucket: instructor upload/delete; enrolled students download

## New Edge Function

**`generate-course-quiz`**: Receives course_id, fetches material file URLs, extracts text (for PDFs stored in bucket), sends to Lovable AI with structured output (tool calling) to generate MCQs with stems, options, correct answers, and explanations. Returns JSON for physician to review.

## UI Changes

### Physician Dashboard / Course Detail
- "Materials" tab: upload files, list materials, delete
- "Generate Quiz" button: triggers AI quiz generation, shows preview, allows publish
- "Students" tab: enhanced roster with student names and enrollment dates
- Notification bell in header with unread count

### Student Dashboard
- Notification bell with unread count and dropdown
- Course detail page shows available materials for download
- Course quizzes available under "Assessments" within enrolled course

### Admin Dashboard
- User management section: list all users with activate/deactivate toggle
- Existing create user modal unchanged

## Implementation Order

1. Database migrations (3 new tables + 1 storage bucket + RLS)
2. Course materials upload UI for physicians
3. Notification system (table + insert triggers + UI bell component)
4. Admin activate/deactivate accounts
5. `generate-course-quiz` edge function with Lovable AI
6. Quiz generation UI for physicians + quiz-taking UI for students
7. Wire notifications into content upload and enrollment flows
8. Translation keys for all new strings

## Technical Notes

- File uploads use Supabase Storage with signed URLs for private bucket access
- AI quiz generation uses Lovable AI Gateway (`google/gemini-3-flash-preview`) with tool calling for structured output
- Notifications are inserted server-side via the edge function or client-side after successful mutations
- Admin account toggle calls the existing `admin-actions` edge function with a new `toggle_account_status` action
- No realtime needed initially — notifications load on page refresh / poll every 60s

