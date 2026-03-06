

# Full Page Translation — Applying i18n Across All Pages

## Current State

The i18n infrastructure is fully built (LanguageContext, 6 locale JSON files, LanguageSwitcher component), but **only the Header and Footer** currently use `useTranslation()`. All ~25+ page components still have hardcoded English strings.

## What Needs to Change

### Phase 1: Public Pages (highest IMG impact)
Replace hardcoded strings with `t()` calls in:
- **Landing.tsx** (~687 lines, ~80 translatable strings — hero, features, stats, programs, testimonials, CTAs)
- **Programs.tsx** — program names, descriptions, features
- **Rotations.tsx** — rotation details, specialties
- **Institutions.tsx** — partnership info
- **Contact.tsx** — form labels, placeholders
- **Apply.tsx** — application form, tiers
- **About.tsx** — mission, values, team
- **Terms.tsx**, **Privacy.tsx** — legal text
- **CaseStudies.tsx** — case study content

### Phase 2: Auth & Onboarding
- **Auth.tsx** (~403 lines) — sign in/up forms, labels, errors
- **Onboarding.tsx** — onboarding steps, document upload labels
- **PendingApproval.tsx** — status messages

### Phase 3: Authenticated Pages (critical for daily IMG use)
- **Dashboard.tsx** (~409 lines) — welcome, stats, navigation cards
- **Atlas.tsx** (~506 lines) — chat UI, placeholder text, error messages, suggested prompts
- **QBank.tsx**, **QBankCreate.tsx**, **QBankSession.tsx**, **QBankReview.tsx**, **QBankPerformance.tsx** — test UI
- **Curriculum.tsx**, **ModuleView.tsx** — lesson content labels
- **ScorePredictor.tsx** — score UI
- **Profile.tsx** — settings labels
- **Admin.tsx** — admin panel labels
- **VirtualRounds.tsx**, **RotationExperience.tsx** — rotation UI
- **Assessments.tsx**, **DiagnosticAssessment.tsx** — assessment UI
- **Residency.tsx** — readiness UI

### Phase 4: Expand Locale JSON Files
Add all new keys to all 6 locale files (en, ar, hi, ur, es, fr) with proper translations.

## Approach

For each page:
1. Import `useTranslation` from `@/i18n`
2. Call `const { t } = useTranslation()` at the top
3. Replace every hardcoded string with `t("section.key")` 
4. Add corresponding keys to `en.json` and all other locale files

## Scope & Effort

- ~25 page files to modify
- ~400+ new translation keys across all pages
- All 6 locale JSON files expanded significantly
- No database or backend changes needed

## Note on ATLAS AI Responses

The ATLAS AI professor's **responses** come from the AI model and are already in whatever language the user writes in (the model responds contextually). The i18n work covers the **UI chrome** around ATLAS — buttons, placeholders, error messages, suggested prompts — not the AI-generated content itself.

