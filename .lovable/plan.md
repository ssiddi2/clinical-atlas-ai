# Live Video Compliance Posture — Keep the PHI Door Open

Goal: run the Teaching Studio on the free LiveKit tier now (education-only, no patient data), while making the PHI upgrade path explicit and the "no real patient data" rule visible to instructors so no one accidentally streams PHI before the compliance work is done.

## What gets built

**1. De-identification guardrail in the Studio**
A short, dismissible notice for instructors when they start a session: teaching content only, no real names, MRNs, DOBs, faces, or unredacted imaging. Dismissal is remembered per user so it isn't nagging. Students don't see it.

**2. A one-line status banner on the Video tab**
The video tab currently falls back to the external meeting link when LiveKit keys aren't set. Make that state legible: explain that in-app video is not yet enabled and that the external link is being used, rather than looking broken.

**3. A written compliance note in the repo**
A short `docs/live-video-compliance.md` covering:
- Current posture: education-only, no PHI, free tier, no BAA.
- What must change before any identifiable patient data appears on stream — either a LiveKit Enterprise plan with a signed BAA, or self-hosted LiveKit so media stays in infrastructure you control.
- The adjacent items that a PHI decision also touches: session recordings, uploaded imaging in course materials and storage buckets, live case content, and audit logging.
- Explicitly: HIPAA does not attach to de-identified teaching material, so the current setup is appropriate for what the platform does today.

## What is deliberately NOT built now

No BAA-tier signup, no encryption-at-rest changes, no recording-retention policy, no audit-log expansion. Those are only justified once you decide real patient encounters are in scope, and doing them speculatively adds cost and complexity for a risk that doesn't exist yet.

## Technical notes

- Guardrail is presentation-only: a small component rendered inside `src/pages/LiveStudio.tsx`, gated to the instructor, persisted via localStorage. No schema change, no new table.
- Video-tab messaging is a copy change inside `src/components/live/LiveVideo.tsx`, in the existing branch that already detects missing LiveKit credentials.
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` stay unset; `supabase/functions/livekit-token` already handles their absence, so nothing breaks.
- No backend, RLS, or migration work in this plan.
