# Fix Admin Login Routing

## Problem
When a platform admin logs in, the auth redirect logic in `Auth.tsx` only checks for `physician` role. Admins fall through to the student path and land on `/dashboard`, forcing them to manually navigate to `/admin`.

## Fix
In `Auth.tsx` `handleAuthRedirect` function (around line 48-67), add a check for `platform_admin` role and route them to `/admin` before the physician and student checks.

### Changes

**File: `src/pages/Auth.tsx`** (lines 48-67)

Add admin role check:
```typescript
const isPhysician = roles?.some(r => r.role === "physician" || r.role === "faculty");
const isAdmin = roles?.some(r => r.role === "platform_admin");

// Admins and physicians skip pending approval check
if (!isPhysician && !isAdmin && profile?.account_status === "pending_approval") {
  navigate("/pending-approval");
  return;
}
if (profile?.account_status === "suspended") {
  // ... existing suspend logic
}

if (isAdmin) {
  navigate("/admin");
} else if (isPhysician) {
  navigate("/physician-dashboard");
} else if (profile?.onboarding_completed) {
  navigate("/dashboard");
} else {
  navigate("/onboarding");
}
```

One file, ~5 lines changed. No database or backend changes needed.