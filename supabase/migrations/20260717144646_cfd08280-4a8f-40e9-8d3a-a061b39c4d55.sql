
-- Fix infinite recursion: virtual_classrooms SELECT policy references classroom_enrollments
-- whose SELECT policy references back to virtual_classrooms. Break the cycle with
-- SECURITY DEFINER helpers that bypass RLS.

CREATE OR REPLACE FUNCTION public.is_classroom_instructor(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.virtual_classrooms
    WHERE id = _classroom_id AND instructor_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_classroom_enrolled(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_enrollments
    WHERE classroom_id = _classroom_id AND student_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_course_enrolled(_course_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE course_id = _course_id AND student_id = _user_id AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_course_instructor(_course_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = _course_id AND instructor_id = _user_id
  )
$$;

-- Rewrite virtual_classrooms SELECT policy
DROP POLICY IF EXISTS "Enrolled, instructor, or admin can view classrooms" ON public.virtual_classrooms;
CREATE POLICY "Enrolled, instructor, or admin can view classrooms"
ON public.virtual_classrooms
FOR SELECT
USING (
  auth.uid() = instructor_id
  OR public.has_role(auth.uid(), 'platform_admin'::app_role)
  OR public.is_classroom_enrolled(id, auth.uid())
  OR (course_id IS NOT NULL AND public.is_course_enrolled(course_id, auth.uid()))
);

-- Rewrite classroom_enrollments "instructors can view" to break the cycle
DROP POLICY IF EXISTS "Instructors can view enrollments for their classrooms" ON public.classroom_enrollments;
CREATE POLICY "Instructors can view enrollments for their classrooms"
ON public.classroom_enrollments
FOR SELECT
USING (public.is_classroom_instructor(classroom_id, auth.uid()));

-- Also rewrite course_enrollments instructor policies (same recursion pattern)
DROP POLICY IF EXISTS "Instructors can view enrollments for their courses" ON public.course_enrollments;
CREATE POLICY "Instructors can view enrollments for their courses"
ON public.course_enrollments
FOR SELECT
USING (public.is_course_instructor(course_id, auth.uid()));

DROP POLICY IF EXISTS "Instructors can update enrollment status" ON public.course_enrollments;
CREATE POLICY "Instructors can update enrollment status"
ON public.course_enrollments
FOR UPDATE
USING (public.is_course_instructor(course_id, auth.uid()));
