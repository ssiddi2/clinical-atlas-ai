

# Plan: Branded Loading Screen with Logo Animation and Progress Bar

## Overview
Add a premium loading splash screen that displays immediately when the page loads, featuring the Livemed logo icon with a subtle animation and a sleek progress bar. This gives users instant visual feedback while the React app, JavaScript bundles, and heavy animation components initialize.

---

## How It Works

The loading screen has two layers:

1. **HTML-based splash** (in `index.html`) -- renders instantly before any JavaScript loads
2. **React-managed fade-out** (in `App.tsx`) -- smoothly dismisses the splash once the app is ready

This means users see the branded loading screen within milliseconds of navigating to the site, not after React boots up.

---

## What The User Will See

```text
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     (dark background)                           │
│                                                                 │
│                                                                 │
│                       ┌─────────┐                              │
│                       │  Logo   │  <- subtle pulse glow        │
│                       │  Icon   │                              │
│                       └─────────┘                              │
│                                                                 │
│                     Livemed Academy                             │
│                                                                 │
│                  ═══════════░░░░░░░░░  <- progress bar          │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Sequence:**
1. Page loads -> splash screen appears instantly (pure HTML/CSS, no JS needed)
2. Logo pulses with a soft blue glow
3. Progress bar animates from 0% to ~90% over 2 seconds
4. React app finishes mounting -> progress jumps to 100%
5. Splash screen fades out smoothly (0.5s transition)
6. Full website is revealed

---

## Technical Details

### File: `index.html`
Add inline HTML and CSS inside the `#root` div so it renders before any JavaScript:

- A centered container with the Livemed logo icon (`/favicon.png` which is already available)
- "Livemed Academy" text below the logo
- A thin progress bar with a gradient animation
- All styles inlined (no external CSS dependency)
- CSS keyframes for the logo pulse glow and progress bar fill
- The background color matches the site exactly: `hsl(230, 55%, 6%)` / `#0d1220`

### File: `src/App.tsx`
Add a small effect that:

- On mount, finds the splash screen element by ID
- Adds a CSS class to trigger fade-out
- Removes the element from DOM after the transition completes
- This ensures the splash is removed cleanly once React is ready

### File: `src/index.css`
Add a utility class for the splash fade-out transition.

---

## Design Specifications

**Logo Animation:**
- Uses the existing Livemed icon (`/favicon.png`)
- Size: 64px on mobile, 80px on desktop
- Soft blue glow pulse animation (2s cycle)
- Glow color matches brand: `hsl(217, 91%, 60%)`

**Text:**
- "Livemed Academy" in white, 14px, letter-spacing 0.15em
- Appears below the logo with subtle opacity

**Progress Bar:**
- Width: 200px (centered)
- Height: 3px (thin and elegant)
- Background track: `rgba(255,255,255,0.08)`
- Fill gradient: cyan to blue (brand colors)
- Animates from 0% to 90% over 2.5s with ease-out
- Jumps to 100% when app is ready

**Fade Out:**
- 0.5s opacity transition
- Element removed from DOM after transition

**Colors:**
- Background: `#0d1220` (matches `--livemed-navy-deep`)
- Logo glow: `hsl(217, 91%, 60%)` with 40% opacity
- Progress fill: gradient from `#00d4ff` (cyan) to `#3b82f6` (blue)

---

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add splash screen HTML/CSS inside `#root` div |
| `src/App.tsx` | Add useEffect to fade out and remove splash on mount |
| `src/index.css` | Add splash fade-out transition class |

---

## Performance Impact

- **Zero JS overhead** -- the splash is pure HTML/CSS, renders before React loads
- **No additional network requests** -- uses `/favicon.png` already cached
- **Tiny footprint** -- approximately 1KB of inline HTML/CSS
- **Clean removal** -- element removed from DOM after fade-out, no memory leak

---

## Why This Approach

| Alternative | Downside |
|-------------|----------|
| React-based loader | Requires React to load first, defeating the purpose |
| External CSS file | Additional network request, delays render |
| This approach (inline HTML) | Renders instantly, zero dependencies, branded experience |

