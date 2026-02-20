

# Implementation Plan: Sign-In Fix + Score Predictor Gating

## Part 1: Approve Team Accounts (Database Update)

Run a SQL update to set all `@livemedhealth.com` accounts to `approved` with `onboarding_completed = true`.

## Part 2: Update `useScorePredictor.ts`

Add question counting from both `assessment_attempts` (sum of `total_questions`) and `qbank_user_progress` (count of distinct answered questions). Return three new fields:

- `totalQuestionsAnswered` (number)
- `insufficientData` (true when < 25)
- `confidenceLevel` (`'none'` | `'low'` | `'moderate'` | `'high'`)

When insufficient data, set `prediction` to `null` instead of computing from defaults. Adjust confidence intervals by tier: +/-25 for low, +/-15 for moderate, +/-10 for high.

## Part 3: Update `ScorePredictor.tsx`

When `insufficientData` is true, show a "Not Enough Data Yet" card with:
- Progress bar showing X/25 questions completed
- CTA button to start a practice assessment (links to `/qbank`)
- Keep disclaimer banner, hide score cards/charts

When data exists but confidence is `low`, show an amber "Early Estimate" badge on score cards. For `moderate`, show a blue badge. For `high`, no badge.

## Part 4: Update `MatchReadyWidget.tsx`

Add optional props: `insufficientData`, `totalQuestionsAnswered`, `confidenceLevel`. When `insufficientData` is true, render a locked state with progress indicator and CTA instead of the score gauge.

## Part 5: Update `Dashboard.tsx`

Pass `insufficientData`, `totalQuestionsAnswered`, and `confidenceLevel` from `useScorePredictor` through `MatchReadyWidgetWrapper` to `MatchReadyWidget`.

## Files to Modify

| File | Change |
|------|--------|
| Database | Approve `@livemedhealth.com` accounts |
| `src/hooks/useScorePredictor.ts` | Add question counting, gating logic, confidence tiers |
| `src/pages/ScorePredictor.tsx` | Gated UI with progress bar + confidence badges |
| `src/components/score/MatchReadyWidget.tsx` | Locked state when insufficient data |
| `src/pages/Dashboard.tsx` | Pass new props through wrapper |

