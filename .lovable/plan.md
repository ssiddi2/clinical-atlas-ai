## Verdict: shippable today after a focused 2-hour cleanup pass

The platform is structurally ready — 39 pages, 124 components, 37 lazy-loaded routes, no console noise, no TODOs, RLS enforced on every user table, sensitive admin work behind an edge function, sign-up + tier + rotation gates all wired. **Not a rewrite.** The remaining risks are tightly scoped and listed below in ship-priority order.

## P0 — Must fix before going live (blocks shipping)

1. **Supabase security warnings (10 WARN)**
   - 1 RLS policy uses `WITH CHECK (true)` on a write operation — too permissive, must be scoped.
   - 4 SECURITY DEFINER functions are anon-executable, 4 are authenticated-executable. `has_role` and `profile_self_update_safe` only need to be callable internally → `REVOKE EXECUTE ... FROM anon, authenticated` and grant only to `service_role` + the policies that need them.
   - 1 public storage bucket (`avatars`) allows directory listing — restrict the storage SELECT policy so listings require an object name match.
   - Single migration handles all of the above.

2. **Demo/dev artefact removal**
   - `seed-demo-data` edge function + `useSeedDemoData` hook are dev tooling. Keep the function but gate it: refuse to run unless the caller has `platform_admin` role (currently relies on a hardcoded demo-account check only).

3. **Auth confirmation behavior verified**
   - Confirm `auto_confirm_email = false` in Supabase Auth (per Core memory) so real students must verify email before sign-in. Already configured — just verify via `cloud_status` + `configure_auth` read before launch.

## P1 — Code-bloat & hygiene cleanup (refactor pass)

Delete 7 unused files (confirmed 0 inbound imports):
- `src/components/FloatingMedicalIcons.tsx`
- `src/components/GlowRings.tsx`
- `src/components/DNAHelix.tsx`
- `src/components/demo/AtlasScene.tsx`
- `src/components/demo/DashboardScene.tsx`
- `src/components/demo/InstitutionalScene.tsx`
- `src/components/demo/RotationScene.tsx`

Reconcile near-duplicates (keep one, delete the other after verifying admin pages use the canonical):
- `PendingApplications.tsx` vs `PendingApprovals.tsx` — both render admin queues from `contact_inquiries` / pending profiles. Consolidate to one component with a `mode` prop.

Strip hardcoded colors on the highest-offender pages (replace `bg-white`/`text-black`/etc with semantic tokens — design-system rule):
- `src/pages/Landing.tsx` (91 instances — biggest offender, and the first page every student sees)
- `src/pages/Dashboard.tsx` (8), `src/pages/Atlas.tsx` (4), `src/pages/Auth.tsx` (5), `src/pages/VirtualRounds.tsx` (5)
- Scope: only the 5 highest-traffic pages today; defer the rest to post-launch.

## P2 — Post-launch (do NOT block ship)

- Large files (`DiagnosticAssessment` 908 LOC, `Landing` 666, `Assessments` 650) work fine but should be split into sub-components after launch. Not a user-facing risk.
- Enable `strict: true` in `tsconfig.app.json` and burn down `any` usages incrementally.
- Add E2E smoke test for the critical path: signup → pending-approval → admin approve → onboarding → learning assessment → dashboard.

## What I will NOT touch in this pass

- No DB schema changes beyond the security fixes.
- No new features.
- No restructuring of working pages (QBank, Atlas, Rotations, Curriculum) — they're tested and stable.
- No design changes — stays dark theme, Inter, rounded-2xl per memory.

## Execution order (single build cycle)

1. **Migration**: tighten RLS write policy + revoke SECURITY DEFINER execute grants + restrict avatars bucket listing.
2. **Edge function**: add `platform_admin` role check to `seed-demo-data`.
3. **Delete** 7 unused asset components.
4. **Consolidate** `PendingApplications` + `PendingApprovals` → one component.
5. **Landing.tsx + Dashboard.tsx + Auth.tsx**: swap hardcoded colors for tokens.
6. **Verify build passes**, then ship.

Estimated diff: ~1 migration, ~10 file deletions/edits, no new dependencies. After approval I'll execute top-to-bottom in one pass.
