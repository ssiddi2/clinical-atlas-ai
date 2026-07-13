# Redesign to match livemedhealth.com (light-only)

Restyle the whole app — public marketing pages **and** the signed-in app — to match the livemedhealth.com look and feel. **No content changes**: all copy, translations, routes, data, and logic stay exactly as-is. This is purely visual/UX (colors, typography, spacing, components, layout rhythm).

## Target design language (from livemedhealth.com)

- **Light only.** White / near-white backgrounds (`#FFFFFF`, `#F6F8FB`), dark near-black text (`#0A0A0A`), soft gray borders.
- **Accent:** vivid livemed blue (~`#0B5CFF` / `hsl(222 100% 52%)`) used for highlighted words, links, stat numbers, and secondary CTAs.
- **CTAs:** solid black pill buttons with white text (primary) + ghost/outline pill (secondary), fully rounded.
- **Nav:** centered floating rounded-pill header on a light surface, subtle shadow.
- **Cards:** white with hairline borders, generous padding, soft shadows, `rounded-2xl`, minimal glow — replace the current glassmorphism/neon glow with clean elevation.
- **Type:** tight, large grotesque display headings (kept on Inter with tighter tracking to approximate the reference), calm gray body text.
- **Stat strips, badge chips, and section number labels** (e.g. "02 The Problem") styled as in the reference.

## Approach

The app is token-driven (shadcn + CSS variables), so most of the shift happens in `src/index.css` + `tailwind.config.ts`. Hardcoded dark utilities in ~34 files then need cleanup.

### 1. Design tokens (`src/index.css`)
- Rewrite `:root` to the light palette: `--background` white, `--foreground` near-black, light `--card`, `--muted`, gray `--border/--input`, blue `--primary`... Set `--primary` to the black pill for buttons and introduce accent-blue token for highlights.
- Collapse `.dark` to equal the light values (or remove dark usage) so nothing renders dark.
- Replace dark-only utilities: glassmorphism (`.glass-*`), neon glows (`.shadow-glow*`, `.logo-glow`, `.text-glow*`), mesh/grid patterns, scrollbar colors — convert to light equivalents (clean shadows, light hairlines) so existing class names keep working without per-file edits where possible.
- Keep Inter; tighten heading `letter-spacing`; keep responsive scale.

### 2. Remove the dark theme
- Simplify `PublicThemeProvider` to always render light (drop the `theme-light` conditional and `localStorage`), or remove it from `PublicLayout`.
- Remove the light/dark toggle buttons + `Sun`/`Moon` from `Header.tsx` (desktop and mobile).
- Logo: always use the light-theme logo asset; drop the `theme === "light" ? ... : ...` conditionals in `Header.tsx` and `Footer.tsx`.

### 3. Public pages (restyle only)
- `Header.tsx`: floating rounded-pill nav on white, black pill "Apply Now", ghost "Sign in", remove `bg-[#030508]` dark surfaces.
- `Footer.tsx`: light surface, gray text, remove `bg-livemed-deep`/mesh; keep all links/columns.
- `Landing.tsx`: light hero (keep hero video but with light overlay/treatment), blue-highlighted headline word, black pill CTAs, clean white stat cards + section-number labels; convert all `text-white`/dark utilities to tokens. Keep every section and all copy.
- Same treatment for `Programs`, `Rotations`, `Institutions`, `About`, `Contact`, `Apply`, `Residency`, `CaseStudies`, `Assessments`, `VirtualRounds`, `Curriculum`.

### 4. App (signed-in) pages
- Restyle to the light system: `Dashboard`, `Atlas`, `QBank*`, `CourseDetail`, `ModuleView`, `DiagnosticAssessment`, `ScorePredictor`, `Auth`, classroom/qbank/dashboard/lesson components, and admin components.
- Most already use semantic tokens, so they follow the token change automatically; the work is replacing hardcoded `bg-[#...]`, `text-white`, `bg-black`, and glass/glow classes with tokens.
- shadcn overlays (`dialog`, `sheet`, `drawer`, `alert-dialog`) get their overlay/`bg-black` opacity checked for light mode.

### 5. Verification
- Typecheck/build.
- Playwright screenshots (desktop + mobile) of `/`, a couple public pages, `/auth`, and `/dashboard` to confirm the light look and no dark-on-dark or white-on-white regressions.

## Notes / trade-offs
- This touches many files; I'll work token-first to minimize per-file churn, then sweep the ~34 files with hardcoded dark utilities.
- Fonts stay on Inter (brand standard) tuned to approximate the reference rather than importing the exact proprietary face; I can swap in a closer grotesque if you want.
- Signed-in pages will match the same light system but won't be pixel-identical to livemedhealth.com (which has no logged-in app) — they'll adopt its color/typography/card language.

## Technical
- Primary edits: `src/index.css`, `tailwind.config.ts`, `src/components/layout/{Header,Footer,PublicThemeProvider,PublicLayout}.tsx`.
- Sweep files flagged for hardcoded dark utilities across `src/pages/*` and `src/components/*`.
- No changes to i18n locale files, Supabase, routes, or business logic.
