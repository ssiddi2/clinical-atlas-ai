## Goal
Prevent Learner-tier students from opening the rotation application modal. Instead, show a clear "Upgrade to Clinical to apply" CTA. Clinical-tier students continue to apply normally; admin approval remains the final gate.

## Changes

### 1. `src/pages/Rotations.tsx` (and any rotation card that triggers `RotationApplicationModal`)
- Use `useFeatureAccess(userId)` to read `canAccessRotationExperience`.
- On the "Apply" button click:
  - **Not signed in** → existing behavior (redirect to `/auth?mode=signup`).
  - **Signed in + Learner tier** → open a new `UpgradeToApplyDialog` instead of `RotationApplicationModal`.
  - **Signed in + Clinical tier** → open `RotationApplicationModal` as today.
- Add a small "Clinical tier required" badge on rotation cards for Learner users so the gate is visible before they click.

### 2. New `src/components/rotations/UpgradeToApplyDialog.tsx`
- Lightweight dialog (reuses existing `Dialog` + `gradient-livemed` styling).
- Copy: explains rotations are part of the Clinical membership, lists 2–3 benefits (live US-physician rotations, LOR support, virtual rounds).
- Primary CTA → `/apply` (existing Clinical application flow).
- Secondary → "Maybe later" closes the dialog.
- Uses `getUpgradeMessage('rotationExperience')` from `useFeatureAccess` for the headline.

### 3. `src/components/rotations/RotationApplicationModal.tsx`
- Defensive guard: on mount, if tier is `learner`, close immediately and toast — prevents any edge path from bypassing the gate.

## Out of scope
- No DB/RLS changes (tier check stays client-side; admin approval on `rotation_enrollments` remains the source of truth).
- No pricing or `/apply` page changes.
- Sign-up flow unchanged — everyone can still sign up freely.

## Technical notes
- `useFeatureAccess` already exposes `tier` and `canAccessRotationExperience` — no new hook needed.
- Keep the dialog under ~60 lines, no new dependencies.
