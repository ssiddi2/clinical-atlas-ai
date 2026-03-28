

# Comprehensive i18n Audit — Hardcoded Strings Remaining

## Problem
Pages use `useTranslation()` at the top level but many **child components** and some **page-level strings** are still hardcoded in English. When a user switches to Arabic, the page headers translate but buttons, labels, nav items, and component text remain in English.

## Files With Hardcoded Strings (Organized by Priority)

### Category 1: Components (never wired to i18n — zero `useTranslation` imports)

These 13 component files have **no translation support at all**:

| File | Hardcoded Strings |
|------|------------------|
| `src/components/qbank/QuestionCard.tsx` | "Question X of Y", "Explanation", "Previous", "Next", "Submit Answer", "Submitting...", "First Aid Reference:", "ID:" |
| `src/components/qbank/QuestionNav.tsx` | "Progress", "Answered:", "Correct:", "Incorrect:", "Flagged:", "Questions", "Legend", "Unanswered" |
| `src/components/qbank/FilterPanel.tsx` | "Question Status", "All Questions", "Unused Only", "Previously Incorrect", "Flagged/Bookmarked", "Difficulty", "Subject", "Organ System", "Specialty", "Select All", "Clear" |
| `src/components/qbank/TestModeSelector.tsx` | "Tutor Mode", "Timed Mode", all descriptions and bullet points |
| `src/components/qbank/LabValuesPanel.tsx` | Lab category names (Serum Chemistry, CBC, etc.) — medical terms, keep in English |
| `src/components/score/MatchReadyWidget.tsx` | "MATCH Ready™", "Complete X+ questions to unlock...", "Start Practice Assessment", "Pass Probability", "percentile", "View Full Analysis", "Step 1" |
| `src/components/score/ScoreGauge.tsx` | "Pass Probability", "Percentile", "This Month" |
| `src/components/score/ScoreHistory.tsx` | "No score history yet..." |
| `src/components/score/ContributingFactors.tsx` | "Question Accuracy", "Clinical Reasoning", "Knowledge Coverage", "Speed & Efficiency", "Performance Trend" + descriptions |
| `src/components/score/PeerComparison.tsx` | "Peer Comparison", "Percentile", "You're performing better than X% of Livemed students" |
| `src/components/score/TopicHeatmap.tsx` | "Complete assessments to see your topic performance" |
| `src/components/dashboard/VerificationBanner.tsx` | "Complete Your Profile", "Verification Pending", "Verification Failed", all descriptions and buttons |
| `src/components/dashboard/UpgradePrompt.tsx` | "Clinical Access Required", "Upgrade to Clinical Access", "Request Clinical Access", "Learn More", all descriptions |
| `src/components/admin/AdminStats.tsx` | "Pending Approval", "Approved Accounts", "Suspended", "Total Users", etc. |
| `src/components/admin/StudentProfileModal.tsx` | "Academic Information", "USMLE Status", "Contact Information", "Career Goals", etc. |
| `src/components/InlineDemoPlayer.tsx` | Scene titles: "ATLAS AI", "Virtual Rotations", "Dashboard", "Get Started" |

### Category 2: Pages with partial translation (have `useTranslation` but many strings still hardcoded)

| File | Hardcoded Strings |
|------|------------------|
| `src/pages/Dashboard.tsx` | Upcoming items titles ("Cardiology Module Review", etc.), "Module 12 of 24 • 35 min remaining", "Cardiology: Heart Failure Management", ATLAS chat preview quote |
| `src/pages/Landing.tsx` | Testimonial quotes/names/roles, ATLAS demo chat messages |
| `src/pages/Programs.tsx` | All `subjects` arrays (medical subject names like "Anatomy & Embryology"), some feature fallbacks |
| `src/pages/QBankSession.tsx` | "Loading session...", "Session Not Found", "Tutor/Timed Mode", "answered", "Lab Values", "End Test", "End Test?", "Answered", "Unanswered", "Continue Test", "End & Review", unanswered warning |
| `src/pages/QBankReview.tsx` | "Session Review", "View Performance", "New Test", "Correct", "Incorrect", "Skipped", "Total Time", "Questions", "Analysis", "All Questions", "Explanation", "Performance by Difficulty/Subject", "Select a question to view details" |
| `src/pages/QBankPerformance.tsx` | "Performance Analytics", "No Data Yet", "Start Practicing", "Practice More", "Average Score", "Correct Answers", "Study Time", "Tests Completed", "Score Trend", "By Subject/System/Difficulty", "Performance by Subject/Organ System/Difficulty", "accuracy", "questions attempted" |
| `src/pages/ModuleView.tsx` | Extensive hardcoded strings throughout (not yet audited in detail — 609 lines) |

### Category 3: Missing locale translations
The `ar.json`, `ur.json`, and `es.json` files need ~200+ new keys added to match the new component-level keys.

## Implementation Plan

### Step 1: Add ~150 new keys to `en.json`
New sections: `qbank.session.*`, `qbank.review.*`, `qbank.performance.*`, `qbank.filter.*`, `qbank.nav.*`, `qbank.question.*`, `qbank.testMode.*`, `score.widget.*`, `score.gauge.*`, `score.factors.*`, `score.peer.*`, `score.history.*`, `score.heatmap.*`, `dashboard.verification.*`, `dashboard.upgrade.*`, `admin.*`, `demo.*`

### Step 2: Wire `useTranslation()` into all 15+ component files
Add `import { useTranslation } from "@/i18n/LanguageContext"` and replace every hardcoded string with `t("key")`.

### Step 3: Fix remaining hardcoded strings in partially-translated pages
Dashboard upcoming items, Landing testimonials, Programs subjects, QBankSession/Review/Performance pages, ModuleView.

### Step 4: Translate new keys into `ar.json`, `ur.json`, `es.json`

### Note on Medical Terms
Lab values, medical subject names (Cardiology, Anatomy), and USMLE-specific terminology should remain in English as they are standardized medical terms used internationally.

