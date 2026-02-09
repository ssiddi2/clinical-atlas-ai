

# Fix: Invisible Mobile Header + Further Mobile Performance

## Problem
The header is invisible on mobile because:
1. The header uses `bg-transparent` when not scrolled
2. The hero background applies a `from-black/60` gradient overlay at the top (in `HeroBackground.tsx`), making the area extremely dark
3. The hamburger menu icon is only `text-white/70` (70% opacity white) -- nearly invisible against the dark overlay
4. The logo image may also lack contrast against the dark gradient

## Fix 1: Make Header Always Visible on Mobile
**File: `src/components/layout/Header.tsx`**

- On mobile, always apply a semi-transparent dark background with blur so the header has its own surface -- never fully transparent
- Increase hamburger icon contrast to `text-white` (full opacity) on mobile
- Keep desktop behavior unchanged (transparent until scrolled)

## Fix 2: Remove Top Fade Overlay on Mobile
**File: `src/components/HeroBackground.tsx`**

- Hide the top `h-32 from-black/60` gradient overlay on mobile (`hidden md:block`) since the header now has its own background
- This prevents double-darkening that kills visibility

## Fix 3: Additional Mobile Performance Gains
**File: `src/pages/Landing.tsx`**

- Remove framer-motion `useScroll`/`useTransform` parallax on mobile (unnecessary JS overhead)
- Ensure all `motion.div` wrappers on mobile render as plain `div` with no animation props

## Files Modified

| File | Change |
|------|--------|
| `src/components/layout/Header.tsx` | Always show background on mobile; boost icon contrast |
| `src/components/HeroBackground.tsx` | Hide top fade overlay on mobile |
| `src/pages/Landing.tsx` | Skip parallax scroll tracking on mobile |

## Expected Result
- Header immediately visible on all mobile devices
- Faster mobile load with less JS execution
- No visual changes on desktop

