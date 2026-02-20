
# Add Transparency Disclaimer for Virtual Rotations & LORs

## Context

The virtual rotations take place at partner hospitals that have approved the program. Letters of Recommendation (LORs) come directly from the attending physician at the hospital -- not from Livemed Academy itself. This is an important distinction and a strong selling point that should be communicated transparently.

## What Will Change

### 1. Virtual Rounds Page (`src/pages/VirtualRounds.tsx`)

Add a transparency disclaimer card below the hero banner, styled as an informational alert (not a warning). Content:

> **About Our Clinical Rotations**
>
> Virtual rotations are conducted via live telemedicine at US partner hospitals that have approved Livemed's clinical observation program. Letters of Recommendation are written and signed by the attending physician at the hospital, on hospital letterhead. Clinical hours are observational telemedicine hours; acceptance and recognition of these hours varies by residency program. We recommend confirming with your target programs how they evaluate telemedicine-based clinical experiences.

### 2. Apply Page (`src/pages/Apply.tsx`)

Add a shorter disclaimer near the bottom of the application form:

> **Clinical Transparency:** Virtual rotations are conducted at approved US partner hospitals via telemedicine. LORs are issued by hospital-affiliated attending physicians. Recognition of telemedicine-based clinical hours varies by residency program.

### 3. Landing Page (`src/pages/Landing.tsx`)

In the Virtual Rotations feature section, add a one-line note:

> LORs from hospital-affiliated US physicians on institutional letterhead.

This reinforces the value (real physician, real hospital letterhead) without cluttering the marketing page.

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/VirtualRounds.tsx` | Add an `Alert` component (from `src/components/ui/alert.tsx`) below the hero banner with the full transparency disclaimer. Uses `Info` icon from lucide-react. |
| `src/pages/Apply.tsx` | Add a small info card/alert near the form submit area with the short disclaimer. |
| `src/pages/Landing.tsx` | Add a one-line subtitle under the Virtual Rotations feature card mentioning LORs from hospital physicians. |

No new files, no database changes, no dependencies needed. The `Alert` component already exists in the project.
