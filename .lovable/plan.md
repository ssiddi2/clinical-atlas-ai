

# Remove False Stats & Add Real Specialty Rotations

## Problem

Multiple pages display fabricated metrics (10,000+ students, 95% USMLE pass rate, 500+ residency placements) that constitute false advertising. These need to be replaced with accurate, verifiable claims.

## What Changes

Replace the inflated stats across 4 files with accurate information focused on what Livemed actually offers: **50+ partner hospitals** and the **specialty rotations covered**.

### New Stats (replacing the old ones)

- **50+** Partner Hospitals (keep -- this is real)
- **8+** Specialty Rotations
- **Live** US Physician Rounds
- **JCo** Accredited Care (where appropriate)

### Specialties Listed

Cardiology, Pulmonology, ICU/Critical Care, Nephrology, Neurology, Internal Medicine, Infectious Disease, and more.

---

## Files to Modify

### 1. `src/pages/Landing.tsx` (lines 110-115)

Replace the 4-stat array:
- Remove: "10,000+ Students Enrolled", "95% USMLE Pass Rate", "500+ Residency Placements"
- Keep: "50+ Partner Hospitals"
- Add: "8+ Specialties" and "Live US Physician Rounds"
- Add a subtitle line listing the specialties (Cardiology, Pulmonology, ICU, Nephrology, Neurology, Internal Medicine, Infectious Disease)

### 2. `src/components/demo/InstitutionalScene.tsx` (lines 9-13, 40)

Replace the 3-stat array:
- Remove: "10,000+ Students Enrolled", "95% USMLE Pass Rate"
- Keep: "50+ Partner Hospitals" (update label to "Partner Hospitals")
- Add: "8+" Specialty Rotations, "Live" US Rounds
- Update tagline from "From 10 to 10,000 students..." to something accurate like "Live virtual rotations across 8+ medical specialties"

### 3. `src/pages/Institutions.tsx` (lines 70-74)

Replace stats:
- Remove: "10,000+ Students Trained", "95% Satisfaction Rate"
- Keep: "50+ Partner Hospitals", "15 Countries"
- Add: "8+ Specialties" and "Live Rounds"

### 4. `src/pages/About.tsx` (lines 134-136)

Update the stat card label from "Partner Institutions" to "Partner Hospitals" for consistency.

---

## Technical Details

All changes are simple string replacements in stat arrays and JSX text. No logic, database, or component structure changes needed.
