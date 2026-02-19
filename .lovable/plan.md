

# Fix Sign-In Flow + Add Score Predictor Minimum Question Threshold

## Issue 1: Sign-In Not Working

**Root Cause**: Not a code bug. All users except one have `account_status = 'pending_approval'`. The one approved user (`dr.siddiqi@livemedhealth.com`) has `onboarding_completed = false`, so they redirect to `/onboarding` instead of the dashboard.

**Fix**: Two changes needed:

1. **Approve existing users via database** -- Update all `livemedhealth.com` team accounts to `account_status = 'approved'` and optionally set `onboarding_completed = true` so they can access the dashboard immediately.

2. **Add admin self-approval** -- The first admin user (`dr.siddiqi`) should be granted `platform_admin` role (if not already) so they can approve future users from the Admin panel.

**SQL migration:**
```sql
-- Approve Livemed team accounts
UPDATE profiles 
SET account_status = 'approved', onboarding_completed = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@livemedhealth.com'
);
```

## Issue 2: Score Predictor Shows Predictions With Zero Data

**Current behavior**: With 0 questions answered, the predictor shows hardcoded defaults (225 Step 1, 232 Step 2, 85% pass probability). This is misleading.

**Fix**: Add a minimum question threshold and a gated UI.

### Minimum Threshold Options

Based on statistical reliability for a weighted 5-factor model:
- **25 questions** = enough for a rough directional estimate with wide confidence intervals
- **50 questions** = sufficient for a moderately reliable prediction

**Recommendation**: Use **25 questions as minimum to show any prediction**, with a "low confidence" badge below 50 questions and "moderate confidence" at 50+. This is honest and encourages continued use.

### Changes to `useScorePredictor.ts`

- Add a `totalQuestionsAnswered` count to the returned data
- Add an `insufficientData` boolean flag (true when < 25 questions)
- Add a `confidenceLevel` field: `'none' | 'low' | 'moderate' | 'high'`
  - `none`: < 25 questions
  - `low`: 25-49 questions  
  - `moderate`: 50-99 questions
  - `high`: 100+ questions
- When `insufficientData` is true, return `null` for the prediction (no hardcoded defaults)

### Changes to `ScorePredictor.tsx`

- When `insufficientData` is true, show a "Not Enough Data" state instead of fake scores
  - Display how many questions the user has answered so far (e.g., "12 / 25 questions completed")
  - Show a progress bar toward the 25-question threshold
  - CTA button: "Start a Practice Assessment" linking to `/assessments` or `/qbank`
- When confidence is `low` (25-49 questions), show predictions with a prominent "Low Confidence" badge and wider confidence intervals (plus/minus 25 instead of 15)
- When confidence is `moderate` (50-99), show "Moderate Confidence" badge with standard intervals
- Keep the existing educational disclaimer banner

### Changes to `MatchReadyWidget.tsx` (Dashboard widget)

- Also respect the minimum threshold
- Show "Complete 25+ questions to unlock your MATCH Ready Score" when insufficient data

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useScorePredictor.ts` | Add `totalQuestionsAnswered`, `insufficientData`, `confidenceLevel` to output; remove hardcoded defaults when < 25 questions |
| `src/pages/ScorePredictor.tsx` | Add gated UI: "Not Enough Data" state for < 25 questions, confidence badges for 25-49 and 50-99 |
| `src/components/score/MatchReadyWidget.tsx` | Add locked state when insufficient data |
| Database migration | Approve existing Livemed team users so they can sign in to the dashboard |

## Summary

- Sign-in fix: approve team accounts via migration
- Score predictor: enforce 25-question minimum before showing any predictions, add confidence tiers, remove misleading hardcoded defaults
