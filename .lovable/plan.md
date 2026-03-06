

# Full App Internationalization (i18n)

## Context

The app targets International Medical Graduates (IMGs) who speak Arabic, Hindi, Urdu, Spanish, and French. We need a full i18n system with a language switcher that translates the entire UI.

## Approach

Use a lightweight, React-native i18n pattern with JSON translation files and a React Context provider. No heavy library needed -- we'll build a simple `useTranslation` hook backed by context and JSON dictionaries.

## Languages

English (default), Arabic (ar), Hindi (hi), Urdu (ur), Spanish (es), French (fr)

## What Will Be Built

### 1. Translation Infrastructure

- **`src/i18n/locales/en.json`** -- English strings (the master file, ~200 keys covering all pages)
- **`src/i18n/locales/ar.json`**, **`hi.json`**, **`ur.json`**, **`es.json`**, **`fr.json`** -- Translated equivalents
- **`src/i18n/LanguageContext.tsx`** -- React context providing current locale, `setLocale()`, and a `t(key)` translation function
- **`src/i18n/index.ts`** -- Barrel export

### 2. Language Switcher Component

- **`src/components/layout/LanguageSwitcher.tsx`** -- A dropdown (using the existing `Select` component) in the Header showing language name + flag emoji. Persists selection to `localStorage`.

### 3. RTL Support for Arabic/Urdu

- The `LanguageContext` will set `dir="rtl"` on the `<html>` element when Arabic or Urdu is selected.
- Tailwind already supports RTL via the `rtl:` variant -- we'll add `dir` attribute handling.

### 4. Page-by-Page Translation

All hardcoded strings across every page will be replaced with `t("key")` calls. This covers:
- Header nav items, Footer links
- Landing page (hero, features, stats, programs, CTA)
- Programs, Rotations, VirtualRounds, Institutions, Contact, Apply, About, Terms, Privacy
- Dashboard, Profile, Admin pages
- Atlas chat UI, QBank UI, Score Predictor
- Auth/Onboarding flows
- All button labels, form placeholders, toast messages

### 5. Images

Images themselves stay the same (medical diagrams, logos). Only alt text and surrounding captions/labels get translated.

## Technical Details

| Item | Detail |
|------|--------|
| New files | `src/i18n/` directory with 7 files (context + 6 locale JSONs + index) + `LanguageSwitcher.tsx` |
| Modified files | Every page and layout component (~40 files) to import `useTranslation` and replace strings |
| Dependencies | None new -- uses existing `Select` component and React context |
| Database | No changes |
| RTL | `dir` attribute on `<html>`, Tailwind `rtl:` utilities where needed |

### Translation Key Structure

```json
{
  "nav.programs": "Programs",
  "nav.rotations": "Rotations",
  "hero.title": "The Future of Medical Education",
  "hero.subtitle": "AI-powered clinical training...",
  "features.atlas.title": "ATLAS™ AI Professor",
  "dashboard.welcome": "Welcome back",
  "auth.signIn": "Sign In",
  "auth.signUp": "Sign Up"
}
```

### Implementation Order

1. Create i18n context + English JSON + hook
2. Add LanguageSwitcher to Header
3. Translate public pages (Landing, Programs, Rotations, etc.)
4. Translate authenticated pages (Dashboard, Atlas, QBank, etc.)
5. Add Arabic RTL support
6. Add remaining language JSON files (translations will be comprehensive but may need native speaker review)

This is a large refactor touching ~40 files. The structure is straightforward but the volume of string extraction is significant.

