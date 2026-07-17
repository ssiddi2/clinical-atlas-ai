## ATLAS AI UX Rebuild — `src/pages/Atlas.tsx`

Rework the layout so students get a clean, stable chat surface with one fixed top bar and a well-behaved conversation history sidebar.

### 1. One fixed top bar
- Replace the current two headers (sidebar's "Back to Dashboard" link + main chat area's separate header) with a single sticky top bar spanning full width.
- Top bar contents, separated by vertical column dividers:
  - Back button (ArrowLeft → `/dashboard`)
  - `|` New Chat icon button (Plus, starts a new conversation)
  - `|` ATLAS™ brand: gradient Brain icon + "ATLAS™" title + "AI Professor" subtitle + AdaptedBadge
  - Right side: Livemed Academy logo (hidden on small screens)
- Bar is `sticky top-0 z-40` with `bg-background` + border so it stays visible while asking questions.
- Column dividers: `<div className="h-6 w-px bg-border" />`.

### 2. Fixed sidebar (chat history)
- Sidebar becomes a fixed-height column `h-[calc(100vh-56px)]` sitting directly under the top bar; only its internal list scrolls.
- Remove the Back button and New Chat button from the sidebar (both moved into the top bar).
- Remove `truncate` on conversation titles. Instead:
  - Use `line-clamp-2` with `break-words` so long titles wrap below to a second line instead of showing "…".
  - Row uses `items-start` + comfortable vertical padding so wrapped titles look intentional.
- Sidebar does not move while messages stream — main chat scroll is isolated.

### 3. Main chat area
- Wrap in a fixed-height flex column `h-[calc(100vh-56px)]` so the composer stays pinned at the bottom and only the message list scrolls.
- Keep existing empty state, suggested prompts, message bubbles, streaming cursor, and composer logic untouched.

### 4. Mobile behavior
- On `<md`, hide the sidebar (as today) and keep the single fixed top bar.
- The New Chat icon in the top bar replaces the sidebar's button on mobile.

### Technical notes
- All changes scoped to `src/pages/Atlas.tsx`; no backend or other files.
- Use existing tokens (`bg-background`, `border-border`, `gradient-livemed`) — no hardcoded colors.
- No changes to streaming, Supabase calls, message rendering, or i18n keys.

```text
┌─────────────────────────────────────────────────────────────┐
│ ← │ + │ 🧠 ATLAS™  AI Professor · [Adapted]      [logo]   │  sticky
├───────────────┬─────────────────────────────────────────────┤
│ Conversation  │                                             │
│ title that    │        Chat messages (scrolls)              │
│ wraps to two  │                                             │
│ lines cleanly │                                             │
│               ├─────────────────────────────────────────────┤
│ (scrolls)     │  [ textarea ............... ] [ Send ]      │
└───────────────┴─────────────────────────────────────────────┘
```
