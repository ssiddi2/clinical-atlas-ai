## Changes

**1. Landing testimonials — real Unsplash portraits**
`src/pages/Landing.tsx` — enlarge the avatar circle (w-14 h-14) and swap the DiceBear initials `<img>` for curated Unsplash portrait URLs (one per testimonial), using `?auto=format&fit=crop&w=200&h=200&q=80` for tight square crops. Keep the `onError` fallback.

Portraits:
- Dr. Maria Santos → female professional portrait
- Ahmed Khalil → male student portrait
- Dr. James Wilson → older male professional portrait

**2. Contact page — "Looking for something specific?" color**
`src/pages/Contact.tsx` line 116 — the heading sits on a blue `cta-surface` block but currently renders dark due to global overrides. Force white with `!text-white` on the `<h3>`, so the heading matches the white link list beneath it.

**3. Institutions — graduation cap color**
`src/pages/Institutions.tsx` line 140 — the `GraduationCap` icon on the blue CTA card currently inherits dark. Add `text-white` (and drop `opacity-80` so it's fully white, keeping visual weight).

No structural/content changes.