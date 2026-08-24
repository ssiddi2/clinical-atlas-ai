# Dashboard Next — ATLAS-first adaptive surface

A new dashboard experience at `/dashboard/next`, built alongside today's `/dashboard` with a toggle to switch between them. Nothing on the current dashboard is removed — every existing tile survives, re-expressed as a predictive card.

## The experience

**Mobile (single pane)**
- Full-height scrolling card stack.
- A liquid-glass ATLAS input bar floats over the bottom edge: blurred translucent surface, soft inner highlight, subtle lift shadow, safe-area aware. Tap to expand into a sheet with the live chat; collapse back to the bar.
- Cards swipe left to dismiss/snooze, and expose an action row on tap-and-hold.

**Desktop (two vertical panes)**
- Left: the predictive card board. Right: ATLAS.
- Draggable divider between them, with the split ratio remembered per user (localStorage). Snap points at 50/50 and a collapsed-chat state.
- The same liquid-glass composer anchors the bottom of the ATLAS pane.

## Predictive cards

One ranked feed replaces the fixed grid. Ranking is deterministic in this pass, from data the app already has: weak areas, in-progress topics, upcoming/live lectures, pending course invites, quiz and QBank performance, verification and subscription state, score-predictor readiness. An ATLAS ranking/copy layer plugs into the same interface later without touching the card components.

Card types (all mapped from what's on the dashboard today): Resume topic, Live/upcoming lecture, Pending invitation, Weak-area drill, Diagnostic assessment, Study plan step, Score predictor / match readiness, Verification or membership nudge, Course progress.

Each card carries an action set:
- Open / resume (primary tap)
- Ask ATLAS about this — seeds the chat pane with the card's context
- Build study guide — ATLAS generates a structured guide for the card's topic
- Do questions — jump into a filtered QBank/unit question set
- Bookmark
- Add to group — collect cards into a named study group
- Share
- Dismiss / snooze (swipe on mobile, hover control on desktop)

## ATLAS integration

The existing ATLAS chat is extracted into a reusable component and reused verbatim in behavior — same streaming, history, and markdown — with UI/UX upgrades: the glass composer, tighter message typography, inline card context chips ("about: Chest X-ray"), and streaming media/diagram blocks rendered inline. Chat replies can surface cards back into the board, so a conversation reshapes the feed and the loop can be expanded recursively later.

## Technical notes

- New route `/dashboard/next` in `src/App.tsx`, wrapped in `AppShell`. A small switch on both dashboards flips between old and new, persisted in localStorage.
- New `src/pages/DashboardNext.tsx` plus `src/components/dashboard-next/`: `CardFeed`, `PredictiveCard`, `CardActions`, `GlassComposer`, `SplitPane`, `AtlasPane`.
- `src/hooks/usePredictiveCards.ts` — loads the same queries the current dashboard runs, emits a typed `PredictiveCard[]` through a pluggable `rank()` function so the AI layer drops in later.
- ATLAS extraction: pull the streaming logic and message list out of `src/pages/Atlas.tsx` into `src/components/atlas/AtlasChat.tsx` (+ `useAtlasChat`), used by both `/atlas` and the dashboard pane. `/atlas` keeps its current behavior.
- Bookmarks, groups, and snooze need persistence: one migration adding `student_card_state` (user_id, card_key, state, group_name, snoozed_until) with RLS scoped to `auth.uid()` and the required GRANTs.
- Glass surface expressed as design tokens in `src/index.css` (backdrop blur, translucent surface, highlight ring) — no hardcoded colors in components.
- Drag divider and swipe gestures built with the framer-motion already in the project; keyboard-accessible divider and full ARIA labels on card actions.
- Copy goes through i18n across all 6 locales.

## Build order

1. Route, toggle, split-pane shell, glass composer.
2. ATLAS extraction into the reusable chat + wire it into the right pane.
3. Card feed with deterministic ranking and all card types.
4. Card actions incl. ATLAS handoff and study-guide generation.
5. Migration + persistence for bookmark / group / snooze.
6. Mobile pane, swipe gestures, responsive polish.
