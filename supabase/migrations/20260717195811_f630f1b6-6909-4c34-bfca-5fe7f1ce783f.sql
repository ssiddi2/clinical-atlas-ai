
CREATE POLICY "Students can respond to their own invitations"
ON public.course_enrollments
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id AND status IN ('approved','declined'));
