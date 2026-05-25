
## Goal

Insert a dedicated **Learning Profile Assessment** stage into the student onboarding flow that captures *how* a student learns — not just biographical data — using validated instruments from medical-education research. Use the result to drive a `learning_profile` object that ATLAS, the curriculum engine, QBank, and study-plan widget read to tailor delivery.

## Research Foundation

The questionnaire blends four validated frameworks proven in medical-education literature, not the debunked "learning styles match" myth. We're measuring **how a student processes, paces, and self-regulates information** — variables that genuinely predict performance.

1. **VARK (Fleming)** — sensory input preference (Visual / Aural / Read-Write / Kinesthetic). Used widely in med schools to vary presentation, not to gate content.
2. **Kolb Experiential Learning Cycle** — Concrete Experience → Reflective Observation → Abstract Conceptualization → Active Experimentation. Maps to whether a student prefers case-first vs theory-first.
3. **Motivated Strategies for Learning Questionnaire (MSLQ — Pintrich)** — measures self-regulation, metacognition, test anxiety, study effort. Strongest predictor of USMLE performance per multiple JAMA/Academic Medicine studies.
4. **Cognitive Load & Pacing (Sweller / van Merriënboer)** — chunk size, spaced-repetition tolerance, intrinsic vs extraneous load preferences.

Plus 3 medical-context items: prior-knowledge baseline, language-of-instruction comfort, and clinical-exposure level (informs vignette difficulty).

## Questionnaire Design (~18 questions, 4–5 min)

Delivered as a **structured form** (not free-chat) after the conversational profile step but before document upload. Form is faster, more reliable for scoring, and the AI still wraps it warmly. Mix of Likert (1–5), multi-select, and 2 short scenario items.

**Section A — Input Preference (VARK, 4 Qs)**
- "When learning a new disease, I understand it best when I…" (multi-select: diagram, lecture/podcast, textbook chapter, hands-on case)
- "A confusing concept clicks for me when someone…" (4 options mapping to V/A/R/K)
- "I retain pharmacology best via…" (mnemonic image / spoken explanation / written tables / patient case)
- "If given 30 min to learn ECGs, I would…" (watch video / listen to lecture / read chapter / practice strips)

**Section B — Processing Style (Kolb, 3 Qs)**
- "I prefer to start a new topic with…" (real patient case ↔ underlying mechanism)
- "After a lecture, I learn most by…" (reflecting/journaling ↔ immediately doing questions)
- "I'd rather be given…" (a framework to apply ↔ examples to derive the rule from)

**Section C — Self-Regulation (MSLQ subset, 5 Qs)**
- Likert: "I set specific study goals each week."
- Likert: "When I don't understand, I keep trying different strategies."
- Likert: "I get anxious during timed tests."
- Likert: "I review material at spaced intervals rather than cramming."
- Likert: "I can study for 45+ min without losing focus."

**Section D — Pacing & Cognitive Load (3 Qs)**
- Preferred lesson length: 5 / 15 / 30 / 60 min
- Preferred chunk size: micro-cards ↔ long-form chapters
- Tolerance for ambiguity: "I'm comfortable when a case has no single right answer." (Likert)

**Section E — Medical Context (3 Qs)**
- Prior QBank exposure: none / UWorld / Amboss / Kaplan / other
- Comfort with English clinical vocabulary (Likert 1–5)
- Clinical exposure level: pre-clinical / early clinical / sub-I / post-grad

## Scoring → `learning_profile` JSON

Stored on `profiles` as a single JSONB column. Computed client-side then validated server-side.

```json
{
  "vark": { "visual": 0.7, "aural": 0.2, "read": 0.4, "kinesthetic": 0.8, "dominant": "kinesthetic" },
  "kolb_style": "accommodator",           
  "self_regulation_score": 72,            
  "test_anxiety": "moderate",
  "preferred_session_min": 30,
  "chunk_preference": "micro",
  "ambiguity_tolerance": "high",
  "english_comfort": 4,
  "clinical_stage": "early_clinical",
  "prior_qbank": ["uworld"],
  "assessed_at": "2026-05-25T..."
}
```

## How Tailoring Actually Works

This is the part that matters — the profile must *do* something visible. Concrete hooks:

| Profile signal | Effect in product |
|---|---|
| `vark.dominant = visual` | Lessons open with `AnimatedDiagram` first; ATLAS uses ASCII/mermaid by default |
| `vark.dominant = kinesthetic` | Curriculum routes student straight to QBank vignette after a 2-min intro instead of full lesson |
| `kolb_style = diverger/accommodator` | Lessons lead with patient case; theory collapsed below |
| `kolb_style = assimilator/converger` | Lessons lead with mechanism/framework; case at end |
| `self_regulation_score < 50` | StudyPlanWidget adds daily check-ins + smaller goal chunks; weekly review nudges |
| `test_anxiety = high` | LiveQuiz hides the timer by default; confidence slider de-emphasized; ATLAS adds reassurance scaffolding |
| `preferred_session_min` | Curriculum learning-units auto-grouped to that length |
| `chunk_preference = micro` | LearningUnit defaults to "Quick Notes" tab; long lessons split |
| `english_comfort < 3` | ATLAS responses default to simpler vocabulary; medical terms get hover-definitions; UI hints to use language switcher |
| `clinical_stage = pre-clinical` | QBank filters to lower-difficulty vignettes; virtual rounds gated until level up |
| `ambiguity_tolerance = low` | Lessons surface clear algorithms first, edge-cases later |

ATLAS receives the `learning_profile` in its system prompt for every chat, so tutoring style adapts automatically (e.g., "user is a kinesthetic learner with high test anxiety — lead with a case, avoid timed pressure language").

## Implementation

### Database (1 migration)
- Add `learning_profile JSONB` column to `profiles`
- Add `learning_assessment_completed BOOLEAN DEFAULT false`
- Drop the loose `learning_style` text field from the chat extractor (kept for back-compat, no new writes)

### New files
- `src/pages/LearningAssessment.tsx` — multi-step form (one section per screen, progress bar matching onboarding style)
- `src/components/onboarding/LearningQuestionCard.tsx` — Likert / multi-select / scenario primitives
- `src/lib/learningProfile.ts` — scoring functions (VARK weighting, Kolb quadrant mapping, MSLQ subscale aggregation)
- `src/hooks/useLearningProfile.ts` — fetch + memoize profile for any component that wants to adapt UI

### Edits
- `src/pages/Onboarding.tsx` — add new step `learning_assessment` between `learning_preferences` and `document_upload`; route to `/onboarding/learning-assessment` when chat finishes the contact phase
- `supabase/functions/onboarding-chat/index.ts` — remove the chat's `learning_style` question (replaced by the form); keep step-transition logic aware of the new gate
- `supabase/functions/atlas-chat/index.ts` and `supabase/functions/lecture-copilot/index.ts` — load `learning_profile` and inject a short adaptation paragraph into system prompts
- `src/components/dashboard/StudyPlanWidget.tsx` — read `self_regulation_score` and adjust nudges
- `src/components/learning-unit/LearningUnitOverview.tsx` — reorder Case-vs-Theory blocks based on `kolb_style`
- `src/components/qbank/QuestionCard.tsx` and `src/pages/QBankSession.tsx` — respect `test_anxiety` (hide/show timer toggle default) and `clinical_stage` (default difficulty filter)

### UX
- Visible as a fifth pill in the onboarding progress bar: **Learning Profile**.
- Header copy: *"How you learn — 4 minutes. We use this to shape your lessons, QBank pacing, and ATLAS tutoring."*
- After submission: brief animated result card showing dominant VARK + Kolb style + 2-line "what changes for you" summary, so the user sees immediate value. Then continues to document upload.
- Re-takeable later from Profile page (link: "Retake learning assessment").

## Out of Scope (ask if you want)
- Adaptive difficulty algorithm that *learns* from QBank performance (this plan only seeds initial preferences)
- A/B testing framework to measure whether tailoring improves outcomes
- Exporting the learning profile to physicians/preceptors before a rotation
- Multilingual translation of the assessment itself (English only for v1)

## Open Questions
1. **Form vs continued chat?** Plan assumes a structured form for scoring reliability. If you prefer the AI to *converse* through it (slower but warmer), say the word and I'll adapt.
2. **Mandatory or skippable?** Plan makes it required to finish onboarding. Skip option = degraded personalization.
3. **Retake cadence?** Plan exposes "Retake" anytime; we could also auto-prompt every 6 months.
