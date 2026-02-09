

# Mobile Performance & Responsiveness Optimization

## Goal
Achieve 2-5 second load time on mobile and ensure full responsiveness across all screen sizes.

## Root Causes of Slow Mobile Loading

1. **6 heavy animation components** (ParticleBackground canvas, DNAHelix canvas, GradientOrbs, GlowRings, ECGLine SVGs, FloatingMedicalIcons) all load on mobile despite being barely visible
2. **framer-motion** runs dozens of concurrent animations on the landing page (every section uses motion.div with whileInView)
3. **Google Fonts (Inter)** loaded as render-blocking external resource
4. **Unused video file** (`hero-background.mp4`) sitting in assets (increases build size)
5. **InlineDemoPlayer** imports 4 scene components eagerly -- heavy for mobile
6. **Demo player height** is fixed at 420px/520px regardless of screen size -- clips on small phones

## Plan

### 1. Disable All Canvas/SVG Animations on Mobile

Modify `HeroBackground.tsx` to skip ALL animation layers on mobile (< 768px). Mobile users see only the CSS gradient background -- instant paint, zero JS overhead.

- Check `window.innerWidth < 768` before scheduling animations
- On mobile: render only the static CSS radial gradient (already there)
- On desktop: keep current deferred lazy-load behavior

### 2. Simplify Landing Page Animations on Mobile

In `Landing.tsx`, extend the existing `noAnim` pattern (currently only hero) to ALL sections on mobile:

- Skip `whileInView` animations for stats, features, programs, ATLAS, testimonials, and CTA sections
- Replace motion.div with plain div on mobile for below-fold content
- Keep desktop animations unchanged

### 3. Lazy-Load Demo Player Scenes

In `InlineDemoPlayer.tsx`:

- Lazy-import all 4 scene components (AtlasScene, RotationScene, DashboardScene, InstitutionalScene) instead of eager imports
- Only load the current scene, not all 4 upfront
- Make the player height responsive: reduce to `h-[320px]` on small phones (< 380px width) and `h-[380px]` on standard mobile

### 4. Optimize Font Loading

In `index.html`:

- Add `font-display=swap` to the Google Fonts URL (already present but verify)
- Add `<link rel="preload">` for the font CSS to eliminate render-blocking

### 5. Remove Unused Video Asset

Delete `src/assets/hero-background.mp4` -- it's not imported anywhere and adds unnecessary weight to the build.

### 6. Responsive Fixes Across the Page

- **Demo player**: Scale down scene padding from `p-8` to `p-4` on mobile; reduce text sizes inside scenes
- **Stats grid**: Already 2-col on mobile -- verify no overflow on 320px
- **ATLAS chat mockup**: Reduce `ml-6 md:ml-10` indentation; ensure text doesn't clip
- **Institution CTA icons**: Reduce from `w-10 h-10` to `w-8 h-8` on small screens
- **Feature cards**: Ensure single-column on phones with proper padding

### 7. Add CSS `content-visibility: auto` for Below-Fold Sections

Add `content-visibility: auto` and `contain-intrinsic-size` to below-fold sections in `index.css`. This tells the browser to skip rendering off-screen content until scrolled into view -- significant paint savings on mobile.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/HeroBackground.tsx` | Skip all animation layers on mobile |
| `src/pages/Landing.tsx` | Extend `noAnim` to all sections; add responsive tweaks |
| `src/components/InlineDemoPlayer.tsx` | Lazy-load scenes; responsive height |
| `src/components/demo/AtlasScene.tsx` | Reduce padding/text for mobile |
| `src/components/demo/RotationScene.tsx` | Reduce padding/text for mobile |
| `src/components/demo/DashboardScene.tsx` | Reduce padding/text for mobile |
| `src/components/demo/InstitutionalScene.tsx` | Reduce padding/text for mobile |
| `index.html` | Optimize font loading |
| `src/index.css` | Add `content-visibility` for below-fold optimization |

### File Deleted

| File | Reason |
|------|--------|
| `src/assets/hero-background.mp4` | Unused -- not imported anywhere |

### Expected Impact

- **Mobile LCP**: Under 2 seconds (hero text renders instantly, no animation JS blocking)
- **Total Interactive**: 2-4 seconds (deferred non-critical content)
- **Bundle reduction**: Removing video asset + lazy scene loading reduces initial payload significantly
- **No visual regression on desktop**: All changes are mobile-conditional

