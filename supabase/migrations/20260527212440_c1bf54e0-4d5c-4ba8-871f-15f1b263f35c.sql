
-- =========================================================
-- 1) virtual_classrooms: restrict SELECT to enrolled / instructor / admin
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view classrooms" ON public.virtual_classrooms;

CREATE POLICY "Enrolled, instructor, or admin can view classrooms"
ON public.virtual_classrooms
FOR SELECT
TO authenticated
USING (
  auth.uid() = instructor_id
  OR has_role(auth.uid(), 'platform_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.classroom_enrollments ce
    WHERE ce.classroom_id = virtual_classrooms.id AND ce.student_id = auth.uid()
  )
  OR (
    course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.course_enrollments ce2
      WHERE ce2.course_id = virtual_classrooms.course_id
        AND ce2.student_id = auth.uid()
        AND ce2.status = 'approved'
    )
  )
);

-- =========================================================
-- 2) rotation_sessions: restrict SELECT to approved enrollees + admins
--    Provide a sanitized public view so the Rotations browse page still works.
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view rotation sessions" ON public.rotation_sessions;

CREATE POLICY "Approved enrollees and admins can view rotation sessions"
ON public.rotation_sessions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'platform_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.rotation_enrollments re
    WHERE re.session_id = rotation_sessions.id
      AND re.user_id = auth.uid()
      AND re.status = 'approved'
  )
);

-- Public-safe view for the rotation catalog (no meeting_url)
CREATE OR REPLACE VIEW public.rotation_sessions_public
WITH (security_invoker = true) AS
SELECT
  id, title, description, specialty_id,
  physician_name, physician_credentials, physician_institution, physician_avatar_url,
  scheduled_start, scheduled_end, status, max_participants, created_at, updated_at
FROM public.rotation_sessions;

-- The view inherits caller privileges; expose it broadly via a permissive policy
-- on the base table for the non-sensitive columns is not possible, so we use a
-- SECURITY DEFINER function to fetch the catalog instead.
CREATE OR REPLACE FUNCTION public.list_rotation_sessions_public()
RETURNS TABLE (
  id uuid, title text, description text, specialty_id uuid,
  physician_name text, physician_credentials text, physician_institution text, physician_avatar_url text,
  scheduled_start timestamptz, scheduled_end timestamptz, status text,
  max_participants integer, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, title, description, specialty_id,
         physician_name, physician_credentials, physician_institution, physician_avatar_url,
         scheduled_start, scheduled_end, status, max_participants, created_at, updated_at
  FROM public.rotation_sessions;
$$;

REVOKE EXECUTE ON FUNCTION public.list_rotation_sessions_public() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_rotation_sessions_public() TO authenticated;

-- =========================================================
-- 3) courses: restrict draft visibility
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view active courses" ON public.courses;

CREATE POLICY "Published courses visible; drafts only to owner/admin"
ON public.courses
FOR SELECT
TO authenticated
USING (
  status = 'published'
  OR auth.uid() = instructor_id
  OR has_role(auth.uid(), 'platform_admin'::app_role)
);

-- =========================================================
-- 4) lesson_content: require approved account
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view lesson content" ON public.lesson_content;

CREATE POLICY "Approved users can view lesson content"
ON public.lesson_content
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'platform_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.account_status = 'approved'
  )
);

-- =========================================================
-- 5) quiz_questions: require approved account
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view quiz questions" ON public.quiz_questions;

CREATE POLICY "Approved users can view quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'platform_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.account_status = 'approved'
  )
);

-- =========================================================
-- 6) Avatars bucket: stop allowing directory listing
--    Public URLs still work because the bucket is public (CDN bypasses RLS).
-- =========================================================
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

CREATE POLICY "Users can view own avatar via authenticated SELECT"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- =========================================================
-- 7) Revoke EXECUTE on internal helpers from anon/authenticated
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_self_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.profile_self_update_safe(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role must remain callable by authenticated (used inside RLS via SECURITY DEFINER,
-- but client code also calls it); keep authenticated grant.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- =========================================================
-- 8) Realtime: enable RLS on realtime.messages so broadcast/presence
--    channels can't be subscribed to anonymously. postgres_changes
--    are still governed by the underlying table RLS.
-- =========================================================
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all broadcast/presence access" ON realtime.messages;
CREATE POLICY "Deny all broadcast/presence access"
ON realtime.messages
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);
