
-- 1. Profile enrichment fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hobbies text[],
  ADD COLUMN IF NOT EXISTS why_medicine text,
  ADD COLUMN IF NOT EXISTS languages_spoken text[];

-- 2. Rotation application workflow fields
ALTER TABLE public.rotation_enrollments
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS application_reason text,
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_notes text;

-- Allow physicians + platform admins to view/update rotation applications
DROP POLICY IF EXISTS "Reviewers can view all rotation applications" ON public.rotation_enrollments;
CREATE POLICY "Reviewers can view all rotation applications"
ON public.rotation_enrollments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'physician'::app_role)
  OR public.has_role(auth.uid(), 'faculty'::app_role)
  OR public.has_role(auth.uid(), 'platform_admin'::app_role)
);

DROP POLICY IF EXISTS "Reviewers can update rotation applications" ON public.rotation_enrollments;
CREATE POLICY "Reviewers can update rotation applications"
ON public.rotation_enrollments
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'physician'::app_role)
  OR public.has_role(auth.uid(), 'faculty'::app_role)
  OR public.has_role(auth.uid(), 'platform_admin'::app_role)
);

-- 3. Avatars bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Rotation applications bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rotation-applications', 'rotation-applications', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own rotation CV" ON storage.objects;
CREATE POLICY "Users can upload their own rotation CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rotation-applications'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own rotation CV" ON storage.objects;
CREATE POLICY "Users can view their own rotation CV"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rotation-applications'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Reviewers can view all rotation CVs" ON storage.objects;
CREATE POLICY "Reviewers can view all rotation CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rotation-applications'
  AND (
    public.has_role(auth.uid(), 'physician'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
    OR public.has_role(auth.uid(), 'platform_admin'::app_role)
  )
);
