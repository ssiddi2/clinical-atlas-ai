## Root cause

Notification links point to `/courses/:id`. In `src/pages/CourseDetail.tsx`, when the course row can't be loaded (RLS blocks read for a not-yet-approved enrollee, or the id doesn't resolve), the component returns `null` at line 100:

```
if (!course) return null;
```

React Router happily mounts the route and the page renders a blank white screen. Same failure mode exists in `VirtualClassroom.tsx` (the other notification target). Auth redirect via `?next=` is already wired correctly.

## Fix

1. **`src/pages/CourseDetail.tsx`** — replace `if (!course) return null;` with an `AppShell`-wrapped fallback: a card explaining the course can't be opened (either not enrolled yet, awaiting approval, or removed) plus a "Back to Dashboard" button. Also add a try/catch around `loadData` so a thrown error shows the same fallback instead of leaving `loading=true` forever.

2. **`src/pages/VirtualClassroom.tsx`** — audit the equivalent early-return and apply the same fallback pattern so `?lectureId=...` notifications never render blank.

3. **`src/components/notifications/NotificationBell.tsx`** — guard `handleClick` so a malformed link (empty string, external URL) falls back to `/dashboard` instead of navigating to a non-route.

No schema or notification-trigger changes needed.
