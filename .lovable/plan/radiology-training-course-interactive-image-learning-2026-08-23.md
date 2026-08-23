# Radiology Training Course — Interactive Image Learning

Ship a radiology course where uploaded images work both as teaching material and as graded, interactive image-based cases. Students join by professor invite; admins seed the base course, professors add their own cases.

## What gets built

### 1. Radiology course scaffold (admin-seeded)
A "Diagnostic Radiology Fundamentals" course under the Radiology specialty, with learning units:
Chest X-ray, Abdominal imaging, Musculoskeletal/trauma, Neuro CT/MRI, Emergency findings, Image interpretation basics.
Each unit is a normal learning unit, so all existing instructor tools (materials, lectures, questions, settings, progress) work unchanged.

### 2. Image support on cases
Questions inside a learning unit gain radiology fields: an image, plus modality (X-ray / CT / MRI / US), body region, and an optional "findings" reveal shown after answering. Uploads go to a private bucket and are shown through short-lived signed URLs, matching how course materials are handled today.

Professors upload images from the question editor; admins can do the same on any course.

### 3. Interactive image viewer
A shared viewer used by both teaching material and cases:
- pinch/scroll zoom, drag to pan, double-tap reset
- brightness/contrast sliders (windowing-style), invert toggle
- fullscreen, and a "hide/show findings overlay" toggle for teaching images
- works on touch and desktop

### 4. Student case player
Students get an actual interactive attempt flow in the unit's Questions tab instead of a static list:
image viewer beside the stem → pick an answer → immediate correct/incorrect with explanation and findings reveal → next case → score summary written to existing progress tracking (feeds the 70% unlock gate already in place).

### 5. Radiology media library in the unit
The Materials tab gets an image-gallery mode for radiology units: thumbnail grid, click to open in the interactive viewer, professor captions.

### 6. Logins & roles
No new auth system — the existing student and "Professor or Attending" sign-ins already cover this. Work here is verification and wiring:
- professor invites students to the radiology course via the existing invite flow (student gets a notification + `/invitations` entry)
- students only see the course after accepting, per the existing enrollment restriction
- admins can create/assign the course and add professors from the admin area

## Technical notes

- **Migration**: add `image_url`, `modality`, `body_region`, `findings` to `learning_unit_questions`; new private storage bucket `radiology-images` with RLS allowing instructor upload and enrolled-student read. GRANTs included with the table/policy changes.
- **Data seed** (`run_sql`, not migration): the radiology course row, its `course_topics` tree, and `learning_unit_content` per unit.
- **New components**: `RadiologyImageViewer` (zoom/pan/window/invert), `RadiologyImageUpload`, `QuestionPlayer` (student attempt flow), gallery mode in `CourseMaterials`.
- **Edited**: `LearningUnitQuestions.tsx` (image fields + branch to player for students), `LearningUnitMaterials.tsx`, learning-unit progress write on attempt completion.
- Images you upload in chat get placed into the seeded units as starter cases; the same upload path is available to professors afterwards.

## Not in this pass
Full DICOM parsing/series scrolling, automated AI image reading, and any billing/pricing changes.
