## Fix Settings from Dashboard

**Symptom:** Clicking the Settings gear in the dashboard header (or "Profile" in the avatar dropdown) doesn't land on a working settings page.

### Root causes to fix
1. `src/pages/Profile.tsx` uses a race-prone auth check: `onAuthStateChange` can fire before `getSession()` resolves and immediately `navigate("/auth")`, bouncing the user back to sign-in when they click Settings. Same pattern needs the "check session first, only redirect after we know there's no user" guard already used elsewhere.
2. Several tab labels/copy come from i18n keys (`profile.personalInfo`, `profile.saveChanges`, etc.). If keys are missing, sections render raw keys and feel broken. Fall back to plain English strings so nothing shows as `profile.xxx`.
3. `AppShell` links Settings to `/profile`, but there is no `/settings` route — add `/settings` as an alias so the URL matches the label and never dead-ends.

### Changes
- **`src/pages/Profile.tsx`**
  - Rewrite auth bootstrap: call `getSession()` first, set user, then subscribe to `onAuthStateChange` for later changes. Only redirect to `/auth` after we've confirmed there's no session (not on the first synchronous null).
  - Replace i18n-keyed labels in the Settings UI with plain English where translations are incomplete (headings, tab labels, buttons like Save Changes / Personal Info / Account / Member Since / Upgrade).
  - Ensure the page always renders inside `AppShell` (already true) and never leaves the user on a blank screen while loading — keep the existing skeleton.
- **`src/App.tsx`**
  - Add `<Route path="/settings" element={<Profile />} />` alongside the existing `/profile` route.
- **`src/components/layout/AppShell.tsx`**
  - Point the gear button and the dropdown "Profile" item to `/settings` (label already says "Profile settings") for consistency. Rename dropdown item to "Settings".

### Verification
- Sign in as student, click gear → lands on `/settings` with Account/Security/Membership tabs, all interactive.
- Reload `/settings` directly → stays on the page, doesn't bounce to `/auth`.
- Sign out from Security tab → redirects to `/`.
- Change password, save profile changes → success toasts fire.

No backend or schema changes.