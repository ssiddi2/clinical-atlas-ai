-- Fix: Restrict rotation_sessions to authenticated users only
DROP POLICY IF EXISTS "Anyone can view rotation sessions" ON public.rotation_sessions;

CREATE POLICY "Authenticated users can view rotation sessions"
ON public.rotation_sessions
FOR SELECT
USING (auth.uid() IS NOT NULL);