

# Inline Demo Player on Landing Page

## Overview
Replace the current popup-based demo modal with an inline demo player embedded directly below the hero section. The player will auto-play through scenes (ATLAS AI, Virtual Rotations, Dashboard, Get Started) with tab navigation and a progress slider -- all visible on the page without any popup.

## What You'll See

The hero section remains the same. Below it, where the DemoPreviewCard currently sits, a full-width inline player will display:

```text
┌─────────────────────────────────────────────────────┐
│                  HERO SECTION                       │
│          (unchanged -- text, CTAs, etc.)            │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                                                     │
│           [Scene content auto-playing]              │
│        (ATLAS chat / Rotations / Dashboard)         │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  [ATLAS AI] [Virtual Rotations] [Dashboard] [Get..] │
│  ════════════════════░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│              (progress slider)                      │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                  STATS SECTION                      │
│            (continues as before)                    │
└─────────────────────────────────────────────────────┘
```

- Scenes auto-play and cycle continuously
- Clicking a tab instantly switches to that scene
- A progress bar/slider moves as each scene plays, showing progress across all 4 scenes
- "Watch Demo" hero button scrolls down to this player
- No popup/modal at all

## Technical Details

### New Component: `src/components/InlineDemoPlayer.tsx`

A self-contained inline player that reuses the existing scene components (AtlasScene, RotationScene, DashboardScene, InstitutionalScene). Contains:

- Auto-advancing scene logic (reused from DemoVideoModal)
- Scene content area with AnimatePresence transitions
- Tab buttons for scene switching: "ATLAS AI", "Virtual Rotations", "Dashboard", "Get Started"
- Segmented progress bar that fills as each scene plays
- Looping: when the last scene finishes, it loops back to the first scene
- Styled with the same dark theme (`bg-livemed-navy` / glass-card borders)
- Height: approximately `h-[500px] md:h-[600px]` to give scenes enough room

### File: `src/pages/Landing.tsx`

- Remove the `DemoVideoModal` import and `<DemoVideoModal>` component usage
- Remove the `DemoPreviewCard` import and usage
- Remove `isDemoOpen` state
- Import and place `<InlineDemoPlayer>` between the hero section and the stats section (replacing the DemoPreviewCard position)
- The hero section no longer needs `absolute bottom-0 translate-y-1/2` positioning for the preview card -- the inline player sits as a normal flow element
- "Watch Demo" button scrolls to the inline player via ref
- Stats section padding (`pt-40 md:pt-56`) reverts to normal since no overlapping card exists

### Files to Delete (no longer needed)

- `src/components/DemoPreviewCard.tsx` -- replaced by the inline player
- `src/components/DemoVideoModal.tsx` -- no longer used (popup removed)

### Scene Components (unchanged)

The four scene components remain exactly as they are:
- `src/components/demo/AtlasScene.tsx`
- `src/components/demo/RotationScene.tsx`
- `src/components/demo/DashboardScene.tsx`
- `src/components/demo/InstitutionalScene.tsx`

## Files Summary

| File | Action |
|------|--------|
| `src/components/InlineDemoPlayer.tsx` | Create -- inline player with tabs, progress bar, auto-play |
| `src/pages/Landing.tsx` | Modify -- replace DemoPreviewCard and modal with InlineDemoPlayer |
| `src/components/DemoPreviewCard.tsx` | Delete -- no longer needed |
| `src/components/DemoVideoModal.tsx` | Delete -- no longer needed |

