
# Fix: LIVE CLINICAL SIMULATION Mobile Layout

## Problem
On a 375px mobile viewport, the demo player scenes have overlapping and clipped content:
- Scene content overflows the fixed 320px height container
- Tab buttons ("ATLAS AI", "Virtual Rotations", "Dashboard", "Get Started") are cramped and hard to tap
- Vitals grid in RotationScene and stats in other scenes overflow horizontally
- Text sizes are still too large for the available space

## Changes

### 1. InlineDemoPlayer.tsx -- Increase mobile height and fix controls
- Increase mobile container height from `h-[320px]` to `h-[400px]` so scenes have room to breathe
- Make tab buttons scroll horizontally on small screens (add `overflow-x-auto` and `flex-nowrap`)
- Reduce tab font size further on very small screens

### 2. RotationScene.tsx -- Simplify for mobile
- Reduce header and patient case card spacing
- Make vitals grid use 2x2 layout on very small screens instead of 4 columns
- Reduce differential diagnosis text sizes
- Add `overflow-y-auto` to prevent clipping

### 3. AtlasScene.tsx -- Tighten spacing
- Reduce margins between header, chat, and tags
- Make chat bubble text smaller on mobile
- Ensure feature tags wrap properly

### 4. DashboardScene.tsx -- Fix overflow
- Stack progress and achievements cards vertically on phones under 380px
- Reduce stat row text sizes
- Add overflow protection

### 5. InstitutionalScene.tsx -- Compact layout
- Reduce stats card padding and icon sizes on small screens
- Shrink CTA button padding
- Tighten vertical spacing

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/InlineDemoPlayer.tsx` | Taller mobile container (400px), scrollable tabs |
| `src/components/demo/RotationScene.tsx` | 2x2 vitals grid on small screens, tighter spacing, overflow-y-auto |
| `src/components/demo/AtlasScene.tsx` | Reduced margins and text sizes |
| `src/components/demo/DashboardScene.tsx` | Stack cards on small phones, reduce sizes |
| `src/components/demo/InstitutionalScene.tsx` | Compact padding and spacing |

### Approach
- All scenes get `overflow-y-auto` on the root container to prevent clipping
- Use Tailwind responsive breakpoints (`min-[380px]:`) for fine-grained control
- Reduce padding, margins, and font sizes specifically for sub-380px screens
- Keep desktop layout completely unchanged
