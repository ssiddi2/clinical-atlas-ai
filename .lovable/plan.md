

# Performance Optimization Plan -- End-to-End Audit

## Current Performance Snapshot

| Metric | Current | Target | Industry Benchmark |
|--------|---------|--------|--------------------|
| Full Page Load | 4.5s | < 2.5s | Khan Academy ~2s, Osmosis ~2.5s |
| First Contentful Paint | 1.7s | < 1.2s | Good threshold: 1.8s |
| TTFB | 1.2s | < 0.8s | Most CDN-served SPAs: 0.3-0.6s |
| JS Heap | 16.4MB | < 12MB | Typical SPA: 8-15MB |
| DOM Nodes | 2,620 | < 1,500 | Google recommends < 1,500 |
| CLS | 0.0002 | < 0.1 | Already excellent |
| Script Duration | 738ms | < 400ms | Heavy for a landing page |

## Root Causes Identified

### 1. favicon.png is 569KB (Critical)
The favicon is being used as both the app icon AND preloaded as an LCP asset. At 569KB for a tiny icon, this is ~10x larger than it should be. It's also linked as `<link rel="preload">` so it blocks rendering.

### 2. framer-motion loads eagerly (90KB)
`framer-motion` is imported directly in `Landing.tsx` (not lazy-loaded). The `renderHTML` function from framer-motion consumed 116ms of CPU during scroll. For a landing page, this is heavy.

### 3. ParticleBackground canvas runs O(n^2) on every frame
The `drawParticles` function runs a nested loop comparing every particle pair on every animation frame. This showed up in profiling at 48.7ms during a short scroll.

### 4. lucide-react bundle is 157KB
The full `lucide-react` module loads as a single chunk. Only ~12 icons are used on the landing page.

### 5. 66 script files loaded
Development mode loads modules individually. In production this is bundled, but there's no manual chunking strategy in vite.config.ts.

## Optimization Plan

### Phase 1: Quick Wins (biggest impact, lowest risk)

**1a. Compress favicon.png**
- Replace the 569KB favicon with a properly sized version (< 20KB)
- Remove the `<link rel="preload" as="image" href="/favicon.png">` tag -- favicons don't need preloading
- Expected saving: ~550KB off critical path

**1b. Remove preload of favicon**
- In `index.html`, delete the preload link for favicon.png
- Keep the preconnect to fonts and backend

**1c. Optimize Vite chunking**
- Add `manualChunks` to `vite.config.ts` to split framer-motion, lucide-react, and react-router into separate cached chunks
- This prevents re-downloading the entire vendor bundle on code updates

### Phase 2: Reduce JS on Landing Page

**2a. Reduce particle count and batch canvas draws**
- In `ParticleBackground.tsx`, batch all line draws into a single `ctx.beginPath()` / `ctx.stroke()` call instead of calling `stroke()` per connection
- Reduce default particle count on desktop from current level

**2b. Lazy-load framer-motion animations below the fold**
- The hero section already skips animations on mobile -- extend this pattern
- Wrap below-fold sections (stats, features, programs) in intersection-observer-based loading

### Phase 3: Asset Optimization

**3a. Convert large PNGs to WebP**
- `livemed-logo-full.png` (160KB) and `joint-commission-badge.png` should be converted to WebP
- WebP typically saves 25-35% over PNG

## How This Compares to Other Medical Education Platforms

| Platform | Typical Load | Approach |
|----------|-------------|----------|
| Osmosis | ~2.5s | SSR, minimal JS on landing |
| Amboss | ~2s | Heavy CDN caching, SSR |
| Khan Academy | ~2s | SSR + progressive hydration |
| UWorld | ~3s | Minimal landing page, app behind auth |
| **Livemed (current)** | **4.5s** | SPA, heavy animations, large assets |
| **Livemed (after plan)** | **~2-2.5s** | Optimized assets + chunking + canvas fixes |

Medical education platforms prioritize reliability and speed because users are often studying on mobile connections in hospitals or between shifts. A sub-3-second load is the minimum expectation; the best platforms achieve under 2 seconds.

## Files to Modify

| File | Change |
|------|--------|
| `public/favicon.png` | Compress from 569KB to < 20KB |
| `index.html` | Remove favicon preload link |
| `vite.config.ts` | Add manual chunk splitting for vendor libs |
| `src/components/ParticleBackground.tsx` | Batch canvas draw calls, reduce particle count |

## Accuracy and Reliability Note

This plan focuses purely on performance -- no content or functionality changes. All medical education content, clinical simulations, and AI features remain untouched. The optimizations are standard web performance best practices used across healthcare and education platforms.

