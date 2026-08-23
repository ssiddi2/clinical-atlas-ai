ALTER TABLE public.learning_unit_questions
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS modality text,
  ADD COLUMN IF NOT EXISTS body_region text,
  ADD COLUMN IF NOT EXISTS findings text;

CREATE POLICY "Radiology images readable by course members"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'radiology-images'
  AND (
    public.is_course_instructor(((storage.foldername(name))[1])::uuid, auth.uid())
    OR public.is_course_enrolled(((storage.foldername(name))[1])::uuid, auth.uid())
    OR public.has_role(auth.uid(), 'platform_admin'::app_role)
  )
);

CREATE POLICY "Radiology images insertable by instructors"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'radiology-images'
  AND (
    public.is_course_instructor(((storage.foldername(name))[1])::uuid, auth.uid())
    OR public.has_role(auth.uid(), 'platform_admin'::app_role)
  )
);

CREATE POLICY "Radiology images updatable by instructors"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'radiology-images'
  AND (
    public.is_course_instructor(((storage.foldername(name))[1])::uuid, auth.uid())
    OR public.has_role(auth.uid(), 'platform_admin'::app_role)
  )
);

CREATE POLICY "Radiology images deletable by instructors"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'radiology-images'
  AND (
    public.is_course_instructor(((storage.foldername(name))[1])::uuid, auth.uid())
    OR public.has_role(auth.uid(), 'platform_admin'::app_role)
  )
);