# Live Teaching Studio

## Current state (verified)

- `virtual_classrooms` has a `meeting_url` column that instructors paste a Zoom/Meet link into; `LectureCard.tsx:113` renders it as a plain external `<a>`. There is no video code in the app.
- `recording_url` exists on `virtual_classrooms` but is never read or written anywhere.
- `classroom_enrollments.attended` is a boolean that nothing ever sets to true — attendance is not actually tracked.
- What does work: `live_quizzes` + `live_quiz_responses` (AI-generated via the `generate-live-quiz` function), `live_reactions` (class pulse), and `lecture_copilot_questions` (private AI Q&A), all wired to Realtime.
- `AnimatedDiagram.tsx` and `ClinicalTimeline.tsx` exist and are handled in `LessonContentRenderer`, but nothing in the app ever creates content of those types — there is no authoring UI.

## What gets built

### 1. Real in-app video (LiveKit)

A `livekit-token` edge function mints room tokens after verifying the caller is the classroom instructor or an enrolled student. Instructor gets publish + screen-share + recording rights; students get subscribe + optional mic/cam that the instructor can grant.

New `LiveRoom` component using `@livekit/components-react`: speaker-focused video, screen share, mic/cam controls, participant tiles, and a screen-share-priority layout so slides/whiteboard dominate. Recording writes back to the existing unused `recording_url` column.

Requires a **LiveKit Cloud** account (free tier is generous). I will need three values from you: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`. The old `meeting_url` field stays as a fallback for already-scheduled lectures.

### 2. Live whiteboard + annotation

A canvas layer the instructor draws on: freehand pen, highlighter, arrow, text, eraser, colors, plus an "annotate over screen share" mode for marking up an ECG or CT image live. Strokes broadcast over a LiveKit data channel for low latency and snapshot to a `whiteboard_snapshots` table so late joiners and post-lecture review get the board.

### 3. Animated clinical diagrams (finally usable)

An instructor-facing authoring UI that writes `animated_diagram` and `clinical_timeline` rows into `lesson_content` — a step builder where each step has a label, description, and a picked SVG scene, with live preview using the existing components. Plus a **live push** mode: the instructor steps through a diagram during the lecture and every student's screen advances in sync via Realtime.

A small starter library of parameterised SVG scenes (cardiac cycle, nephron, action potential, ventilation/perfusion, acid-base map) so professors are not writing raw SVG.

### 4. Presence, roster and real attendance

`classroom_presence` table plus LiveKit presence: live roster showing who is in the room, joined-at, connection quality. A heartbeat accumulates `attendance_minutes`, and on lecture end a job flips `classroom_enrollments.attended` based on a threshold — closing the gap where that column is currently always false.

Adds a raise-hand queue and a cold-call picker that weights toward students who have not been called on or who flagged "confused" in the pulse meter.

### 5. Live case simulator

New `live_cases` + `live_case_steps` + `live_case_votes` tables. The instructor drives a branching virtual patient: present the vignette, students vote on the next action, results reveal live as a bar chart, then labs/imaging/vitals unlock for the chosen branch. AI-assisted case generation reuses the existing Lovable AI pattern from `generate-live-quiz`.

### 6. The Studio shell

`/teach/:classroomId` — instructor cockpit: video + stage on the left, right rail tabs for Roster, Whiteboard, Diagram, Quiz, Case, Pulse, Co-Pilot queue. Everything already built (quizzes, reactions, co-pilot) moves into this shell instead of being separate modals.

`/live/:classroomId` — student view: synced stage (video / whiteboard / diagram / case), reaction buttons, quiz overlay, private Co-Pilot sidebar.

## Technical details

- `@livekit/components-react`, `livekit-client`, and `livekit-server-sdk` (edge function) added.
- Every new table gets explicit GRANTs and RLS scoped through the existing `is_classroom_instructor` / `is_classroom_enrolled` security-definer functions.
- New tables added to `supabase_realtime` publication; channels created inside `useEffect` with teardown.
- High-frequency data (whiteboard strokes, cursor) goes over LiveKit data channels, not Postgres, to avoid Realtime cost blowup; only snapshots persist.
- Light-only theme and existing `lm-card` / AppShell patterns are respected throughout.

## Build order

1. LiveKit token function + `LiveRoom` embedded in the lecture page (replaces the external link).
2. Studio + student shells, migrating quiz/pulse/co-pilot into them.
3. Presence, roster, real attendance.
4. Whiteboard + screen annotation.
5. Diagram authoring + live sync.
6. Live case simulator.

To start step 1 I need your LiveKit Cloud URL, API key, and API secret — everything else can be built without them.