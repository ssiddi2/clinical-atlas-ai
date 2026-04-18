
DROP POLICY IF EXISTS "Admins full access live_quizzes" ON public.live_quizzes;
CREATE POLICY "Admins full access live_quizzes"
  ON public.live_quizzes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role));

DROP POLICY IF EXISTS "Admins full access responses" ON public.live_quiz_responses;
CREATE POLICY "Admins full access responses"
  ON public.live_quiz_responses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role));
