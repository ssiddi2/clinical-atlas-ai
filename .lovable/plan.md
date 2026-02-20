

# Fix ATLAS Chat for Production Launch

## Critical Bug Fixes

### 1. Fix Edge Function Authentication

The current `atlas-chat` edge function uses `supabaseClient.auth.getClaims(token)` which is not a valid Supabase JS method. Replace with `supabaseClient.auth.getUser()` which properly validates the JWT and returns the user.

Also add:
- 429/402 error handling from the AI gateway (surface rate limits to users)
- Upgrade model from `google/gemini-2.5-flash` to `google/gemini-3-flash-preview`

### 2. Add Streaming Support

Convert from non-streaming (wait for full response) to SSE streaming:
- Edge function streams tokens as they arrive from the AI gateway
- Frontend reads the stream and renders tokens progressively
- Students see the response building in real-time instead of staring at a spinner

### 3. Add Markdown Rendering

Install `react-markdown` and render ATLAS responses with proper markdown support:
- Headers, bold, italic for emphasis
- Bullet points and numbered lists for differentials
- Code blocks for mnemonics or formulas
- This is critical for medical content readability

### 4. Surface Error States

When the AI gateway returns 429 (rate limit) or 402 (credits exhausted):
- Show a friendly toast message explaining the issue
- Don't leave users with a generic "Failed to send message" error

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/atlas-chat/index.ts` | Fix auth (getUser instead of getClaims), add streaming, handle 429/402, upgrade model |
| `src/pages/Atlas.tsx` | Add SSE stream parsing, add markdown rendering, handle rate limit errors |

## Files to Install

| Package | Purpose |
|---------|---------|
| `react-markdown` | Render AI responses with proper formatting |

## Technical Details

### Edge Function Changes

```text
- Replace getClaims(token) with getUser()
- Enable stream: true in AI gateway request
- Return response.body as SSE stream
- Catch 429 -> return { error: "rate_limited" }
- Catch 402 -> return { error: "credits_exhausted" }
- Model: google/gemini-3-flash-preview
```

### Frontend Streaming Pattern

```text
- Use fetch() with the full function URL (not supabase.functions.invoke, which doesn't support streaming)
- Read response.body as ReadableStream
- Parse SSE lines: extract delta.content tokens
- Append tokens to assistant message in real-time
- Save complete message to database after stream finishes
```

### Markdown Rendering

```text
- Wrap assistant message content in <ReactMarkdown>
- Add prose styling for clean typography
- Support: headers, lists, bold, italic, code blocks
- Keep user messages as plain text
```

## Competitive Context

For reference, here's how ATLAS compares once these fixes are in:

| Feature | ATLAS (after fix) | Amboss | UWorld | Osmosis |
|---------|-------------------|--------|--------|---------|
| AI Socratic Teaching | Yes (streaming) | Basic AI | No | No |
| Markdown-rich responses | Yes | Yes | N/A | N/A |
| Real-time streaming | Yes | Yes | N/A | N/A |
| Conversation history | Yes | Limited | No | No |
| USMLE-aligned | Yes | Yes | Yes | Yes |
| Virtual Rotations | Yes | No | No | No |
| JCo-accredited parent | Yes | No | No | No |

## Pricing Recommendation (for your consideration)

Based on the two-tier access model already built into the platform:

**Learner Tier (Self-Signup)**
- Target: $39-49/month or $299-399/year
- Includes: Curriculum, QBank, ATLAS (with daily message limit), Score Predictor
- Comparable to: Amboss ($25-50/mo), UWorld ($50-80/mo for QBank only)
- Your advantage: ATLAS AI professor included at no extra cost

**Clinical Tier (Application Required)**
- Target: $199-299/month or $1,500-2,500/semester program fee
- Includes: Everything in Learner + Virtual Rotations, Unlimited ATLAS, Residency Prep, LOR support
- No direct competitor -- virtual US rotations with real physicians is unique
- Program-based pricing (e.g., $3,000-5,000 for a 12-week rotation program) may work better than monthly for this tier since it mirrors how clinical rotations are traditionally priced

The key insight: Learner tier competes on price with existing tools but offers more (ATLAS). Clinical tier has no real competitor, so you have pricing power -- price on value, not comparison.

