

User has multiple asks bundled together. Let me parse:

1. **ATLAS capability question** — Can it tutor conversationally? (Answer: yes, already implemented per memory `atlas-chat-implementation` — Gemini 3 Flash SSE streaming. I should explain capabilities + propose enhancements.)

2. **Restore conversational AI signup questionnaire** — They previously had an AI-driven onboarding (still exists: `onboarding-chat` edge function + `onboarding_conversations` table + `Onboarding.tsx` page). User wants to confirm it asks about: hobbies, medical school, country, age, career goals. Need to verify current questions and ADD missing fields (hobbies, age).

3. **Virtual rotations should require application** — Currently `rotation_enrollments` allows direct self-enrollment (RLS: `auth.uid() = user_id`). Need application/approval flow.

4. **Profile pictures for students AND attendings** — `profiles.avatar_url` exists but no upload UI. Need avatar upload component + storage bucket policies.

Let me check current onboarding to know what to add and current avatar handling.

I have enough context from the system prompt. Let me design.

---

# Plan: ATLAS Tutor Mode + Richer Onboarding + Rotation Applications + Profile Photos

## 1. ATLAS as a Conversational Tutor (clarification + small upgrade)

ATLAS already works as a streaming AI chat (Gemini 3 Flash, markdown, SSE). What it can do **today**:
- Answer any USMLE/clinical question conversationally
- Explain concepts, walk through differentials, generate mnemonics
- Maintains conversation memory per session (`eli_conversations` + `eli_messages`)

**Small upgrade:** Add a "Tutor Mode" system-prompt variant so ATLAS asks Socratic follow-up questions ("What would you order next? Why?") instead of just answering. One-line change in the `atlas-chat` edge function — toggle via a button in the chat UI.

## 2. Richer AI Onboarding Questionnaire

Current `onboarding-chat` collects: institution, country, year, USMLE status, target specialty, study habits, contact. **Missing per your request:** hobbies, age, "why medicine" story.

**Changes:**
- Extend `ExtractedData` interface + system prompt in `supabase/functions/onboarding-chat/index.ts` to also collect:
  - `age` (from date_of_birth — already in profiles)
  - `hobbies` (new column on profiles)
  - `why_medicine` (new column — short personal story)
  - `languages_spoken` (new column)
- Migration: add `hobbies text[]`, `why_medicine text`, `languages_spoken text[]` to `profiles`.
- Update conversation flow to weave these in naturally between academic and career sections.

## 3. Profile Pictures (Students + Attendings)

`profiles.avatar_url` column exists — no upload UI today.

**Changes:**
- New storage bucket `avatars` (public read, authenticated write to own folder).
- New component `AvatarUpload.tsx` — drag/drop, crops to square, uploads to `avatars/{user_id}/avatar.jpg`, writes URL to `profiles.avatar_url`.
- Add to `Onboarding.tsx` (final step before document upload) and `Profile.tsx` (editable anytime).
- Display avatars on `LectureCard`, `PhysicianDashboard`, course rosters, and admin views.

## 4. Virtual Rotation Application Process

Today: `rotation_enrollments` lets students self-enroll directly. You want an application gate.

**Changes:**
- Add `status text default 'pending'` + `application_reason text` + `cv_url text` columns to `rotation_enrollments`.
- New table policies: students INSERT with status='pending'; only physicians/admins UPDATE to 'approved'/'rejected'.
- New `RotationApplicationModal.tsx` — short form: why this rotation (200 words), upload CV/transcript.
- Update `Rotations.tsx` "Enroll" button → "Apply".
- Admin/physician view: pending applications list with approve/reject + reviewer notes (extend `PendingApprovals.tsx` or create `RotationApplications.tsx`).
- On approval: create notification + grant Meet link access.

## Database Changes

```text
profiles:
  + hobbies text[]
  + why_medicine text
  + languages_spoken text[]

rotation_enrollments:
  + status text default 'pending'
  + application_reason text
  + cv_url text
  + reviewed_by uuid
  + reviewed_at timestamptz
  + reviewer_notes text

storage.buckets: avatars (public)
storage.buckets: rotation-applications (private)
+ RLS policies for both
```

## Files to Create

- `src/components/profile/AvatarUpload.tsx`
- `src/components/rotations/RotationApplicationModal.tsx`
- `src/components/admin/RotationApplications.tsx`

## Files to Edit

- `supabase/functions/onboarding-chat/index.ts` (add fields + flow)
- `src/pages/Onboarding.tsx` (add avatar step)
- `src/pages/Profile.tsx` (avatar editor)
- `src/pages/Rotations.tsx` (Apply button + modal)
- `src/pages/Admin.tsx` (rotation applications tab)
- `src/components/classroom/LectureCard.tsx` (show instructor avatar)
- `src/components/layout/Header.tsx` (show user avatar)

## Out of Scope (ask if you want these)

- Auto-cropping/face detection on avatars (using base browser cropping only)
- ATLAS voice mode (separate feature)
- Hobby-based student matching/study groups

