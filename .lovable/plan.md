

# Expand QBank + Populate All 27 Lesson Modules

## Current State

**QBank:** 60 questions total (8 easy, 38 medium, 14 hard). Only 14 hard questions exist across all subjects. Several subjects have zero hard questions (Hematology, Pharmacology).

**Curriculum:** 24 lesson modules exist but only 1 module (Heart Failure: Pathophysiology) has any lesson content -- just 3 text sections. The other 23 lesson modules are completely empty. Students clicking into them see blank pages.

## What This Plan Delivers

### Part 1: QBank Expansion (+60 hard USMLE-level questions)

A new edge function `seed-qbank-hard-questions` will insert 60 additional hard-difficulty clinical vignettes, bringing the total to ~120 questions with proper difficulty distribution.

**Question distribution by subject (6 hard questions each):**

| Subject | Current Hard | After |
|---------|-------------|-------|
| Cardiology | 3 | 9 |
| Pulmonology | 3 | 9 |
| Neurology | 0 | 6 |
| Gastroenterology | 2 | 8 |
| Endocrinology | 2 | 8 |
| Nephrology | 3 | 9 |
| Infectious Disease | 1 | 7 |
| Hematology | 0 | 6 |
| Pharmacology | 0 | 6 |
| Pathophysiology | 0 | 6 |

Each question will follow USMLE Step 1/Step 2 CK format:
- Multi-sentence clinical vignette with relevant history, vitals, labs
- 5 answer choices with one best answer
- Detailed explanation with pathophysiology and why other options are wrong
- Tagged with subject, system, topic, difficulty "hard", board_yield, and keywords

### Part 2: Lesson Content for All 24 Modules

A new edge function `seed-lesson-content` will populate lesson_content rows for all 24 lesson modules. Each module gets 5-6 sections:

1. **Introduction/Overview** (content_type: "text") -- Definition, epidemiology, relevance
2. **Pathophysiology** (content_type: "text") -- Mechanisms, pathways, cellular/molecular basis
3. **Clinical Presentation** (content_type: "text") -- Signs, symptoms, physical exam findings
4. **Diagnosis** (content_type: "text") -- Labs, imaging, diagnostic criteria
5. **Clinical Pearl** (content_type: "clinical_pearl") -- High-yield board fact
6. **Key Points** (content_type: "key_points") -- 5-7 bullet point summary

This means ~144 lesson sections across all modules, each with medically accurate USMLE-aligned content.

**Modules covered:**

**Internal Medicine (6 modules):**
- Diabetes Mellitus: Pathophysiology
- Diabetes Management
- Diabetic Complications
- Hypertension
- Chronic Kidney Disease
- Liver Disease

**Cardiology (7 modules):**
- Heart Failure: Pathophysiology (already has 3 sections -- will add remaining)
- Heart Failure: Diagnosis
- Heart Failure: Management
- Acute Coronary Syndrome
- Arrhythmias: Basics
- Cardiac Pharmacology
- Valvular Heart Disease

**Pulmonology (6 modules):**
- COPD
- Asthma
- Pneumonia
- Pulmonary Embolism
- Chest X-ray Interpretation
- Pulmonary Function Tests

**Neurology (6 modules):**
- Stroke: Ischemic
- Stroke: Hemorrhagic
- Seizures and Epilepsy
- Headache Disorders
- Neurological Examination
- Movement Disorders

## Implementation Approach

Due to the large volume of content (~200+ database rows), this will be split across multiple edge functions to stay within execution limits:

1. **`seed-qbank-hard-questions/index.ts`** -- 60 hard QBank questions
2. **`seed-lesson-content/index.ts`** -- Lesson content for all 24 modules, batched by specialty

Each function will:
- Use upsert logic to avoid duplicates if run multiple times
- Include the Supabase service role key for admin-level inserts
- Return a summary of what was seeded

A simple trigger button or API call will seed the data.

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/seed-qbank-hard-questions/index.ts` | 60 hard USMLE vignettes across 10 subjects |
| `supabase/functions/seed-lesson-content/index.ts` | ~144 lesson sections for 24 modules |

### No Schema Changes Required
The `qbank_questions` and `lesson_content` tables already have the correct structure. This is purely a data seeding operation.

### Content Quality Standard
All questions and lesson text will be written to USMLE Step 1/Step 2 CK level, referencing:
- First Aid for the USMLE Step 1 frameworks
- Pathoma-style pathophysiology explanations
- UWorld-style clinical vignette structure (patient age, sex, history, vitals, labs, question stem)

