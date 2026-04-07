

# Fix QBank — Randomize Correct Answer Positions

## Problem

Every single one of the 60 QBank questions has `correct_answer_index = 0` — the correct answer is **always option A**. This makes the exam trivially predictable and not competitive.

## Solution

Write and run a script that, for each question:
1. Shuffles the `options` array randomly
2. Tracks which option was originally at index 0 (the correct one)
3. Updates `correct_answer_index` to the new position of the correct answer

This is a **data-only fix** — no schema changes, no code changes needed. The QBank UI already handles any `correct_answer_index` value correctly.

## Technical Details

- Use a Python/SQL script to iterate all 60 questions
- For each question: parse the JSON options array, apply a random shuffle, find the new index of the original correct answer, update both `options` and `correct_answer_index`
- Also update `supabase/seed.sql` so future re-seeds don't revert to all-A answers
- Target distribution: roughly equal across indices 0-4 (12 per index for 60 questions)

## Scope

- One database update script (run via psql/python)
- One file edit: `supabase/seed.sql` — update the hardcoded correct_answer_index values and reorder options accordingly
- No UI or component changes needed

