DROP POLICY IF EXISTS "Published courses visible; drafts only to owner/admin" ON public.courses;

CREATE POLICY "Courses visible to public, owner, admin, or enrollees"
  ON public.courses FOR SELECT
  USING (
    status IN ('published','active')
    OR auth.uid() = instructor_id
    OR public.has_role(auth.uid(), 'platform_admin')
    OR EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = courses.id
        AND ce.student_id = auth.uid()
        AND ce.status IN ('invited','approved','pending')
    )
  );