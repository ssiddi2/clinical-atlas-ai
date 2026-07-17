## Goal
Make the student dashboard the "hub" and ensure every page reachable from it works, looks consistent, and shares one unified navigation shell.

## Findings from audit

**Routes:** All links from `Dashboard.tsx` (and its widgets) resolve to real routes in `App.tsx` — no 404s. Links audited: `/atlas`, `/curriculum`, `/courses`, `/virtual-classroom`, `/virtual-rounds`, `/assessments`, `/diagnostic`, `/profile`, `/onboarding`, `/contact`, `/admin`, `/learning-assessment`, `/qbank`, `/score-predictor`.

**Inconsistency (the real problem):** Every authenticated page renders its own bespoke `<header>` element with different styles:

| Page | Header style |
| --- | --- |
| Dashboard | sticky, `bg-background/85 backdrop-blur-xl`, logo + ATLAS™ pill + Admin + Notifications + Avatar |
| Curriculum, VirtualRounds, Assessments, DiagnosticAssessment, Profile, Residency, ModuleView | sticky `bg-background/95` — smaller, different contents |
| Atlas | non-sticky, plain `bg-background` |
| ScorePredictor | `fixed`, `glass-dark` — **breaks light theme** |
| PhysicianDashboard | `bg-card/50 backdrop-blur-sm` |
| LearningAssessment, Onboarding | thin `border-border/40` header — intentionally minimal (flow pages) |
| Courses, VirtualClassroom, QBank, CourseDetail, LearningUnitPage | no `<header>` at all — no way back to dashboard from these pages |

**Extra issues found while auditing:**
- `Dashboard.tsx` navigates to `/learning-assessment` on Take Assessment. That's the mobile-friendly quiz — the Take Assessment tile actually points to `/assessments` (correct).
- ScorePredictor still uses dark-theme utilities (`glass-dark`) — visual regression on light theme.

## Plan

### 1. Create a shared `AppShell` component
`src/components/layout/AppShell.tsx` — renders the exact same top navigation as `Dashboard.tsx` currently does (logo, Curriculum link, ATLAS™ pill, Admin button when applicable, Notifications, avatar dropdown → Profile / Sign out). Sticky, `bg-background/85 backdrop-blur-xl`, `h-14`. Reads role + profile from Supabase once.

### 2. Refactor Dashboard to use `AppShell`
Move the header JSX out of `Dashboard.tsx` into `AppShell`. Dashboard becomes `<AppShell><main>…</main></AppShell>`.

### 3. Wrap every authenticated student page in `AppShell`
Replace each page's bespoke `<header>` with `<AppShell>`:
- `Curriculum`, `ModuleView`
- `Courses`, `CourseDetail`, `LearningUnitPage`  ← currently have no header
- `VirtualClassroom`  ← currently has no header
- `VirtualRounds`
- `Assessments`, `DiagnosticAssessment`
- `Atlas`
- `Profile`
- `Residency`
- `ScorePredictor` (removes the `glass-dark` dark-theme leftover)
- `QBank`, `QBankCreate`, `QBankPerformance`  ← no header today
- `PhysicianDashboard`

Skip (intentionally chromeless): `Auth`, `Onboarding`, `LearningAssessment`, `PendingApproval`, `QBankSession`, `QBankReview`, `LiveQuiz`, `RotationExperience` (focused/full-screen flows).

### 4. Consistency pass
- Remove duplicate imports (Bell, DropdownMenu, avatar, etc.) from every page now that they live in `AppShell`.
- Standardize page body wrapper to `<main class="container mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">` so spacing matches Dashboard.
- Fix any hardcoded dark utilities on ScorePredictor (`glass-dark`, dark gradients) to the light `.lm-card` system.

### 5. Verify
- Click through every link from the dashboard in the preview (Playwright): each page loads, shows the shared header, back-to-dashboard works, no console errors.
- Confirm the ATLAS™ pill is present on every authenticated page and highlights the active route.

## Out of scope
- No new features, no route additions, no data-model changes.
- No changes to marketing / public pages.
- No changes to flow pages (Auth, Onboarding, QBankSession, LiveQuiz, etc.) that intentionally hide chrome.
