
# Fix Admin Login Routing

## Problem
When a platform admin logs in, they land on the student `/dashboard` instead of `/admin`. The auth redirect logic only checks for `physician` role — admins fall through to the student path.

## Fix
In `Auth.tsx`, add a `platform_admin` role check before the physician/student routing. Admins will also skip the pending approval check.

### Change: `src/pages/Auth.tsx` (lines 48-67)

```typescript
const isAdmin = roles?.some(r => r.role === "platform_admin");
const isPhysician = roles?.some(r => r.role === "physician" || r.role === "faculty");

// Admins and physicians skip pending approval
if (!isPhysician && !isAdmin && profile?.account_status === "pending_approval") { ... }

// Route by role priority
if (isAdmin) navigate("/admin");
else if (isPhysician) navigate("/physician-dashboard");
else if (profile?.onboarding_completed) navigate("/dashboard");
else navigate("/onboarding");
```

One file, ~5 lines changed. No database changes needed.
