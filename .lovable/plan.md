

# Increase LIVE CLINICAL SIMULATION Container Height on Mobile

## Change

**File: `src/components/InlineDemoPlayer.tsx`** (line 80)

Update the mobile height values:
- Small phones (< 380px): `h-[400px]` → `h-[480px]`
- Standard phones (380px+): `h-[420px]` → `h-[500px]`
- Desktop stays unchanged at `h-[520px]`

This gives scene content significantly more vertical room to display without clipping or overlap.

