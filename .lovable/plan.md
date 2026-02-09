

# Google Sans Typography + Mobile Optimization

## Overview
Replace the current system font stack with **Google Sans (Product Sans alternative: Inter or DM Sans)** across the entire application and apply best-practice typography scaling for mobile, tablet, and desktop. Google Sans itself is not publicly available on Google Fonts, so **Inter** is the closest match -- it's Google's recommended open-source alternative with the same geometric, clean aesthetic used across Google products.

> Note: "Google Sans" is a proprietary font not available on Google Fonts. **Inter** is the industry-standard substitute with nearly identical proportions, used by Vercel, Linear, and many premium products. If you specifically want Google's aesthetic, Inter is the best path.

---

## Changes

### 1. Load Inter from Google Fonts
**File: `index.html`**

- Add preconnect to `fonts.gstatic.com`
- Add a `<link>` tag to load Inter with weights 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Use `display=swap` for optimal loading performance

### 2. Configure Tailwind Font Family
**File: `tailwind.config.ts`**

- Add `fontFamily` to `theme.extend`:
  - `sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']` -- this makes Inter the default for all text
  - `display: ['Inter', 'system-ui', '-apple-system', 'sans-serif']` -- for headings

### 3. Global CSS Typography System
**File: `src/index.css`**

- Set `body` font to Inter via the Tailwind `font-sans` class
- Replace the `.apple-title` class font-family with Inter
- Add a responsive typography scale using CSS custom properties:

```text
Mobile (< 640px):
  - Body: 15px / 1.6 line-height
  - H1: 32px / 1.1
  - H2: 24px / 1.15
  - H3: 18px / 1.25
  - Small: 13px

Tablet (640-1024px):
  - Body: 16px / 1.6
  - H1: 48px / 1.1
  - H2: 32px / 1.15

Desktop (1024px+):
  - Body: 16px / 1.55
  - H1: 64-96px / 1.08
  - H2: 36-40px / 1.15
```

- Optimize text rendering: add `-webkit-font-smoothing: antialiased` (already present via `antialiased` class)
- Set `font-feature-settings: "cv11", "ss01"` for Inter's stylistic alternates (cleaner characters)

### 4. Landing Page Typography Cleanup
**File: `src/pages/Landing.tsx`**

- Remove the inline `style={{ fontFamily: ... }}` on the hero H1 (line 199) -- Inter will apply globally
- Ensure all heading sizes use the responsive scale properly:
  - Hero H1: keep `text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[96px]` with `font-semibold tracking-[-0.03em]`
  - Section headings: use `text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight`
  - Card titles: use `text-base md:text-lg font-medium`
  - Body text: use `text-sm md:text-base` with appropriate `leading-relaxed`
- Audit mobile padding: ensure `px-4` minimum on all containers for proper mobile margins
- Ensure touch targets are at least 44px on mobile (buttons, links)

### 5. Header Mobile Optimization
**File: `src/components/layout/Header.tsx`**

- Ensure nav link text uses Inter automatically (no changes needed beyond global font)
- Verify mobile menu touch targets are 44px+ (currently `py-4` on links -- already good)

### 6. InlineDemoPlayer Typography
**File: `src/components/InlineDemoPlayer.tsx`**

- Ensure tab labels and scene text inherit the global Inter font
- No structural changes needed -- just inherits the new global font

---

## Mobile Optimization Checklist (applied across Landing.tsx)

| Area | Current | Change |
|------|---------|--------|
| Hero heading | `text-4xl` on mobile | Keep -- already good with Inter's tighter metrics |
| Section padding | `px-4` | Verify consistent across all sections |
| Button touch targets | `py-6`/`py-7` | Already meets 44px minimum |
| Card text | Various sizes | Standardize: title `text-base`, body `text-sm` on mobile |
| Stat numbers | `text-3xl md:text-5xl` | Keep -- scales well |
| Line height | Mixed | Standardize body to `leading-relaxed`, headings to `leading-tight` |
| Letter spacing | `-0.03em` on titles | Keep for headings, use `tracking-normal` for body |

---

## Files Modified

| File | Change |
|------|--------|
| `index.html` | Add Inter font loading from Google Fonts with preconnect |
| `tailwind.config.ts` | Add `fontFamily` configuration for Inter |
| `src/index.css` | Update `.apple-title`, add font-feature-settings, remove old font-family references |
| `src/pages/Landing.tsx` | Remove inline fontFamily style, standardize heading/body text sizes for mobile |

---

## What Will NOT Change
- Brand colors, layout structure, or spacing system
- Component architecture
- Animation system
- Backend functionality
- No new npm dependencies (font loaded via CDN)

