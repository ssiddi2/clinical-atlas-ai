
# Content Verification & Quality Assurance Plan

Students depend on this being right. We build **three complementary systems** — none replaces physician sign-off, but together they catch >95% of issues before students see them.

## Track 1 — Connect the app to Claude Desktop / ChatGPT via MCP

Expose QBank, Assessments, and ATLAS as read-only MCP tools. You (or a reviewing MD) open Claude Desktop, connect to the app, and ask questions like *"Review question qbank_042 against First Aid 2024 — is the correct answer defensible? Are the distractors clinically plausible? Is the explanation aligned with UpToDate?"*

**Auth**: OAuth 2.1 (each reviewer signs in as themselves; RLS enforces admin-only access to review tools).

**MCP tools exposed** (read-only, admin-gated):
- `list_qbank_questions(specialty?, system?, difficulty?, limit)` — batch review
- `get_qbank_question(question_id)` — full stem, options, correct answer, explanation, First Aid ref
- `get_assessment(assessment_id)` — diagnostic + course assessment items
- `get_atlas_conversation(conversation_id)` — audit ATLAS's Socratic responses
- `flag_content_for_review(content_id, reason, severity)` — write-back: Claude/reviewer flags an item
- `search_content(query)` — find items by keyword/concept

**Result**: You point Claude at "Review all cardiology hard questions" and it produces a triage report you act on.

## Track 2 — Physician review pipeline (in-app)

New admin surface for the reviewer workflow. Every QBank question and assessment item gets a lifecycle:
```text
draft → ai_reviewed → md_reviewed → published
                                 ↘ flagged → revision → md_reviewed
```
- **Reviewer queue** (`/admin/content-review`): list of items filtered by status, specialty, and last-review date. Each row shows stem, correct answer, explanation, First Aid ref, and the source(s) it was cross-checked against.
- **Review action**: approve / request revision / reject, with structured reason (accuracy, distractor quality, explanation depth, currency, style-guide fit) and free-text notes.
- **Audit trail**: `content_reviews` table logs who reviewed what, when, verdict, and rationale — permanent record for accreditation.
- **Re-review triggers**: guideline updates (new AHA/USPSTF release), items older than 18 months, or student dispute rate above threshold.

## Track 3 — Automated benchmarking harness (edge function)

For every QBank item and assessment question, run an automated cross-check nightly and on any edit:

1. **Multi-model consensus**: send stem + options to 3 frontier models (Gemini 3.1 Pro, GPT-5.5, and one more). If any model disagrees with the stored correct answer → auto-flag for MD review.
2. **Source cross-reference**: Firecrawl the item's `first_aid_reference` topic against public authoritative sources (USPSTF, CDC, NIH, AHA/ACC guidelines, NBME content outlines). Attach source citations to the review record.
3. **Style-guide compliance**: check vignette structure matches NBME item-writing rules (single best answer, homogeneous distractors, no negative stems, appropriate length).
4. **Currency check**: flag items citing guidelines older than the latest published version.

Nightly report → email/dashboard summary of new flags, ranked by severity.

## Prioritization (per your answer: "everything, risk-ordered")

1. **QBank questions** (~500) — highest student-facing risk, gate to Track 2 review before publish.
2. **Diagnostic + course assessments** — gate progression, so accuracy matters equally.
3. **ATLAS AI outputs** — can't pre-approve live generation; instead: strengthen system prompt with citation requirements, log every conversation, sample-review 5% weekly through the MCP tool.

## What the user should do

- Approve this plan, and I'll build **Track 1 (MCP)** first — that's what unblocks you and any reviewing MD immediately.
- Track 2 (review pipeline) and Track 3 (benchmarking) are separate builds after MCP is live.

## Technical details

- **MCP server**: `@lovable.dev/mcp-js` with Supabase OAuth 2.1. `configure_oauth_server` + consent route + Deno edge function at `/functions/v1/mcp`.
- **Auth**: only users with `platform_admin` role can call review tools; RLS + `has_role()` check in every tool handler.
- **Storage**: new `content_reviews` table (reviewer_id, content_type, content_id, verdict, sources_checked, notes, reviewed_at) with strict RLS.
- **Benchmarking edge function**: `benchmark-content` — nightly cron via `pg_cron` or manual trigger from admin UI. Uses AI Gateway (Gemini + GPT-5) + Firecrawl connector for source lookup.
- **Cost**: MCP is essentially free (per-call gateway usage). Benchmarking ~500 questions × 3 models ≈ modest AI credit usage per run.
- **No student-facing changes** in any track — this is entirely admin/reviewer infrastructure.
