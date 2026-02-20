

# Fix Sign-In Flow + Score Predictor Minimum Question Threshold

## Part 1: Approve Team Accounts

Run a database update to set all `@livemedhealth.com` accounts to `approved` with `onboarding_completed = true`, so team members can sign in and reach the dashboard immediately.

## Part 2: Score Predictor Gating (useScorePredictor.ts)

Add three new fields to the hook's return value:

- `totalQuestionsAnswered` -- count of all questions from `assessment_attempts` plus `qbank_user_progress`
- `insufficientData` -- true when total < 25
- `confidenceLevel` -- `'none'` (< 25), `'low'` (25-49), `'moderate'` (50-99), `'high'` (100+)

When fewer than 25 questions have been answered, set `prediction` to `null` (no hardcoded defaults). Adjust confidence intervals based on tier: +/-25 for low, +/-15 for moderate, +/-10 for high.

## Part 3: ScorePredictor.tsx (Full Page)

When `insufficientData` is true, replace the scores section with a "Not Enough Data Yet" state:
- Show current question count out of 25 with a progress bar
- CTA: "Start a Practice Assessment" linking to `/qbank`
- Keep the educational disclaimer banner
- Hide the contributing factors, score history, and topic heatmap (no data to show)

When data is available but confidence is `low`, show a prominent "Low Confidence -- Early Estimate" badge on the score cards. For `moderate`, show "Moderate Confidence" badge. For `high`, no badge needed.

## Part 4: MatchReadyWidget.tsx (Dashboard Widget)

When `insufficientData` is true, show a locked state:
- "Complete 25+ questions to unlock your MATCH Ready Score"
- Small progress indicator showing X/25
- CTA button to start an assessment

The widget will accept new optional props: `insufficientData`, `totalQuestionsAnswered`, and `confidenceLevel`.

## Part 5: Dashboard.tsx (Widget Wrapper)

Update `MatchReadyWidgetWrapper` to pass the new fields (`insufficientData`, `totalQuestionsAnswered`, `confidenceLevel`) from `useScorePredictor` down to `MatchReadyWidget`.

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| Database (data update) | Approve `@livemedhealth.com` accounts |
| `src/hooks/useScorePredictor.ts` | Add `totalQuestionsAnswered`, `insufficientData`, `confidenceLevel`; count from both `assessment_attempts` and `qbank_user_progress`; return null prediction when < 25 questions |
| `src/pages/ScorePredictor.tsx` | Add "Not Enough Data" gated UI with progress bar; add confidence badges for low/moderate tiers |
| `src/components/score/MatchReadyWidget.tsx` | Add locked state UI when `insufficientData` is true; accept new props |
| `src/pages/Dashboard.tsx` | Pass new props through `MatchReadyWidgetWrapper` |

### Question Counting Logic

Total questions answered = sum of `total_questions` from `assessment_attempts` + count of distinct answered questions from `qbank_user_progress` (to avoid double-counting, use the higher of the two if overlap exists, or simply count distinct `question_id` entries from `qbank_user_progress` where `selected_answer` is not null).

### Confidence Tiers

| Questions | Level | Confidence Interval | Badge |
|-----------|-------|-------------------|-------|
| 0-24 | none | N/A (no prediction shown) | N/A |
| 25-49 | low | +/- 25 points | "Low Confidence -- Early Estimate" |
| 50-99 | moderate | +/- 15 points | "Moderate Confidence" |
| 100+ | high | +/- 10 points | None |

