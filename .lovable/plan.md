## End-to-End QA Audit Plan

I'll run a full audit across auth, roles, navigation, forms, data, UI, and security. One critical bug is already visible in the current network logs and will be fixed first.

### Known critical bug (from live network logs)

- `GET /rest/v1/virtual_classrooms` returns **500 — infinite recursion detected in policy for relation "virtual_classrooms"**. This breaks the student dashboard "Upcoming" widget on every load. Root cause: an RLS policy on `virtual_classrooms` self-references the same table (or references a table whose policy references back). Fix: replace the recursive policy with a `SECURITY DEFINER` helper (pattern already used by `has_role` and `list_rotation_sessions_public`).

### Audit passes I'll run

1. **Static sweep**
  - Enumerate routes in `src/App.tsx` / router, list protected vs public.
  - `tsgo` typecheck + `rg` for `TODO`, dead links, unused routes, duplicate paths.
  - Read every page under `src/pages/**` for empty states, loading, error handling.
2. **Backend / RLS sweep**
  - `supabase--linter` for RLS + security warnings.
  - Query each public table for RLS + GRANTs, flag missing or recursive policies.
  - Verify `has_role`, `handle_new_user`, verification flow, admin-actions edge function boundary.
3. **Live flow tests (Playwright, headless)**
  - Public: `/`, `/programs`, `/rotations`, `/institutions`, `/contact`, `/apply`, `/auth`.
  - Student (demo account): signup → email verify → login → dashboard → curriculum → assessment → QBank → virtual rounds → profile → logout → session persistence → protected-route redirect when signed out.
  - Physician: login → physician dashboard → sessions → roster → reports.
  - Platform admin: login → admin dashboard → user mgmt → approvals → verification review → content review → analytics.
  - Forgot password → reset-password page.
  - Direct URL access to admin pages as student → must redirect / 403.
4. **UI/responsive checks**
  - Screenshot each key route at 375 / 768 / 1280 widths.
  - Check console errors, network 4xx/5xx, focus states, contrast on gradient cards.
5. **Report + auto-fix**
  - Produce the deliverable table (Severity / Route / Repro / Root cause / Fix).
  - Auto-fix Critical + High items in this same run: at minimum the `virtual_classrooms` RLS recursion, any other RLS recursions the linter surfaces, dead links, broken buttons, and obvious null/empty-state crashes.
  - Re-run the failing flows after each fix and stop only when auth, navigation, role-permission, and core user flows are green.

### Order of operations

1. Fix `virtual_classrooms` RLS recursion (migration).
2. Run `supabase--linter` + full route sweep to collect more issues.
3. Run Playwright journeys per role.
4. Patch remaining Critical/High findings.
5. Deliver the QA report.

Approve and I'll switch to build mode and execute. dont mess current design 