

# Plan: Inline Demo Preview Straddling Hero and Below-the-Fold

## Overview
Replace the modal-based "Watch Demo" button with an inline demo preview card embedded directly in the landing page. The preview will be positioned so its top half sits within the hero section and its bottom half extends below the fold -- exactly like the reference image pattern where a large product mockup bridges the hero and the next section.

The "Watch Demo" button in the hero will remain but will scroll the user down to this preview. Clicking the preview itself will open the existing demo modal for the full interactive experience.

---

## What The User Will See

```text
┌─────────────────────────────────────────────────────────────────┐
│                         HERO SECTION                           │
│                                                                 │
│                     Livemed Academy                             │
│                   Where AI Meets Medicine.                      │
│                   Train smarter. Heal better.                   │
│                                                                 │
│                  [Apply Now]  [Watch Demo]                      │
│                                                                 │
│            ┌─────────────────────────────────────┐              │
│            │      ┌───┐ ┌───┐ ┌───┐             │              │
│            │      │ ● │ │ ● │ │ ● │  ATLAS(TM)  │              │
│            │      └───┘ └───┘ └───┘             │              │
│            │                                     │              │
│            │   "A 55-year-old male presents..."  │              │
│ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ FOLD ─ │
│            │   Student: "I would consider..."    │              │
│            │                                     │              │
│            │   "Good start! What physical..."    │              │
│            │                                     │              │
│            │          ▶ Play Full Demo            │              │
│            └─────────────────────────────────────┘              │
│                                                                 │
│                      STATS SECTION                              │
│                   50+  |  10,000+  |  95%  | 500+              │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- The demo preview card appears at the bottom of the hero section, positioned with negative margin so it overlaps into the stats section below
- It shows a static mockup of the ATLAS chat interface (reusing the existing chat mockup already in the ATLAS section)
- A centered "Play Full Demo" button overlays the card -- clicking it opens the existing DemoVideoModal
- The hero "Watch Demo" button scrolls smoothly to this preview card
- On mobile, the card is slightly smaller but maintains the same straddling effect

---

## Technical Details

### File: `src/pages/Landing.tsx`

**Hero section changes (lines 161-257):**
- Add a `ref` to the demo preview section for smooth scroll targeting
- Change the "Watch Demo" button `onClick` from opening the modal to scrolling to the preview card
- After the hero content `motion.div` and before the scroll indicator, insert a new demo preview block

**New demo preview block (inserted between hero content and scroll indicator):**
- A container with `relative z-20` positioned at the bottom of the hero
- Uses negative bottom margin (`-mb-32 md:-mb-48`) to overlap into the stats section
- Contains a glass-card styled mockup showing the ATLAS chat interface (a simplified, static version)
- Has a semi-transparent overlay with a centered play button that triggers `setIsDemoOpen(true)`
- The card has a subtle border glow and rounded corners matching the site's design language
- Max width constrained to `max-w-4xl` and centered

**Stats section changes (lines 259-320):**
- Add top padding (`pt-40 md:pt-56`) to accommodate the overlapping demo preview card

**Chat mockup content inside the preview:**
- Reuses the same visual pattern as the ATLAS section chat mockup (terminal header with dots, message bubbles)
- Shows 2-3 static chat messages -- no animation needed
- A frosted overlay at the bottom with a play icon and "Watch Full Demo" text

### File: `src/components/DemoVideoModal.tsx`
- No changes needed -- modal continues to work as before

---

## Detailed Implementation

### Demo Preview Card Structure

The card will contain:

1. **Browser chrome header** -- three colored dots (red, yellow, green) and an "ATLAS(TM)" label, identical to the existing ATLAS section mockup
2. **Static chat messages** -- 2-3 message bubbles showing the ATLAS conversation preview
3. **Play overlay** -- a centered play button circle with "Watch Full Demo" text, triggered on click to open the modal
4. **Gradient fade** -- bottom portion of the card fades to transparent, creating a clean visual edge

### Positioning Strategy

The card will be placed inside the hero `section` but after the main hero content. It uses:
- `mt-12 md:mt-16` for spacing from the CTA buttons
- `-mb-32 md:-mb-48` negative margin to extend below the hero section boundary into the stats section
- The stats section gets compensating `pt-40 md:pt-56` top padding
- `relative z-20` to sit above background layers

### Scroll Behavior

The "Watch Demo" button scrolls to the preview card using `scrollIntoView({ behavior: 'smooth', block: 'center' })`, centering the card in the viewport.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Landing.tsx` | Add inline demo preview card in hero, adjust stats section padding, update Watch Demo button behavior |

---

## What Will NOT Change

- The DemoVideoModal component and its scenes remain untouched
- Brand colors, typography, and spacing system unchanged
- No new dependencies or assets required
- All other sections remain pixel-perfect
- Mobile responsiveness preserved
- The demo modal still works when triggered from the preview card
