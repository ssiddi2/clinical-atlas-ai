
-- 1. Fix qbank_questions: restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active questions" ON public.qbank_questions;
CREATE POLICY "Authenticated users can view active questions"
  ON public.qbank_questions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 2. Fix notifications: restrict INSERT so users can only insert notifications for themselves
-- Server-side (edge functions with service_role) bypasses RLS, so admin/system notifications still work
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
