## Problems confirmed

1. **Duplicate/mismatched nav on `/apply`** — `Apply.tsx` is already rendered inside `PublicLayout` (which mounts the standard light `Header`), but the page also renders its **own** dark-themed `<header>` (fixed, `bg-livemed-deep`, custom logo + "Already have an account?" button). Result: two navs stacked, and the top one uses the old dark style so it looks completely different from the rest of the site.

2. **Login friction** — In `Auth.tsx` the redirect handler runs from **both** `onAuthStateChange` AND `getSession()` in parallel, and does two sequential Supabase queries (`profiles`, then `user_roles`) inside the `onAuthStateChange` callback. That violates the documented pattern (no awaits inside `onAuthStateChange`) and causes:
   - double redirects / race conditions
   - visible lag after clicking Sign In before navigation
   - occasional "flash" of the auth page after login

3. **Logout friction** — need to verify current sign-out path uses `signOut()` cleanly and lands on `/` without waiting on subsequent authed queries. Will audit `Header` sign-out handler and any `Dashboard` mount-time queries that run before auth is ready.

## Fixes

### A. Unify the navigation on `/apply`
- Remove the inline `<header>` block and the `pt-24` spacer wrapper from `Apply.tsx`.
- Remove the page-level `bg-livemed-deep` / dark glass card styling on the success state and form so it inherits the standard light theme used everywhere else.
- Keep only page content; `PublicLayout`'s `Header` + `Footer` handle chrome. This guarantees one nav bar across the entire public site.

### B. Smooth login
Refactor the redirect effect in `Auth.tsx`:
- Register `onAuthStateChange` first, but inside the callback **do not await** — schedule the redirect via `setTimeout(() => handleAuthRedirect(session), 0)` (documented Supabase pattern).
- Guard against double execution with a `redirectingRef` so `getSession()` and `onAuthStateChange` can't both fire the handler.
- Parallelize the profile + roles reads with `Promise.all` instead of sequential awaits.
- Navigate with `{ replace: true }` so the back button doesn't return to `/auth`.

### C. Smooth logout
- Audit `Header.tsx` sign-out handler: ensure it calls `supabase.auth.signOut()` and immediately `navigate("/", { replace: true })` without awaiting extra work; clear any local React Query cache if present.
- Check `Dashboard.tsx` / other authed pages for queries that fire before session is ready and add an `enabled: !!session` gate if they're causing post-logout error toasts or hangs.

### D. Verify
- Load `/apply` → confirm single light-themed nav matches `/`, `/programs`, etc.
- Sign in with demo account → redirect happens in one hop, no flash.
- Sign out from dashboard → lands on `/` instantly, no console errors.

## Scope
Frontend only. Files touched: `src/pages/Apply.tsx`, `src/pages/Auth.tsx`, `src/components/layout/Header.tsx` (sign-out only), and minimal gating tweaks on `src/pages/Dashboard.tsx` if the audit shows early-fire queries. No backend, RLS, or schema changes.
