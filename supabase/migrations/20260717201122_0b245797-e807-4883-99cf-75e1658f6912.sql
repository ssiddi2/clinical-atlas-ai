
-- 1. Audit log table
CREATE TABLE IF NOT EXISTS public.enrollment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES public.course_enrollments(id) ON DELETE SET NULL,
  course_id uuid NOT NULL,
  student_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  previous_status text,
  new_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enrollment_audit_log_course_idx ON public.enrollment_audit_log(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS enrollment_audit_log_student_idx ON public.enrollment_audit_log(student_id, created_at DESC);

GRANT SELECT ON public.enrollment_audit_log TO authenticated;
GRANT ALL ON public.enrollment_audit_log TO service_role;

ALTER TABLE public.enrollment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own audit rows"
  ON public.enrollment_audit_log FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Instructors view course audit rows"
  ON public.enrollment_audit_log FOR SELECT
  TO authenticated
  USING (public.is_course_instructor(course_id, auth.uid()));

CREATE POLICY "Admins view all audit rows"
  ON public.enrollment_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

-- 2. Trigger functions
CREATE OR REPLACE FUNCTION public.tg_enrollment_audit_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
BEGIN
  IF NEW.status = 'invited' THEN
    _action := 'invited';
  ELSIF NEW.status = 'approved' THEN
    _action := 'enrolled_by_admin';
  ELSE
    _action := 'created_' || NEW.status;
  END IF;

  INSERT INTO public.enrollment_audit_log
    (enrollment_id, course_id, student_id, actor_id, action, previous_status, new_status)
  VALUES
    (NEW.id, NEW.course_id, NEW.student_id, auth.uid(), _action, NULL, NEW.status);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_enrollment_audit_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  _action := CASE NEW.status
    WHEN 'approved' THEN CASE WHEN OLD.status = 'invited' THEN 'accepted' ELSE 'approved' END
    WHEN 'declined' THEN 'declined'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'revoked'  THEN 'revoked'
    WHEN 'invited'  THEN 'resent'
    ELSE 'status_' || NEW.status
  END;

  INSERT INTO public.enrollment_audit_log
    (enrollment_id, course_id, student_id, actor_id, action, previous_status, new_status)
  VALUES
    (NEW.id, NEW.course_id, NEW.student_id, auth.uid(), _action, OLD.status, NEW.status);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_enrollment_audit_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.enrollment_audit_log
    (enrollment_id, course_id, student_id, actor_id, action, previous_status, new_status)
  VALUES
    (OLD.id, OLD.course_id, OLD.student_id, auth.uid(), 'removed', OLD.status, NULL);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS enrollment_audit_ins ON public.course_enrollments;
CREATE TRIGGER enrollment_audit_ins
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.tg_enrollment_audit_insert();

DROP TRIGGER IF EXISTS enrollment_audit_upd ON public.course_enrollments;
CREATE TRIGGER enrollment_audit_upd
  AFTER UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.tg_enrollment_audit_update();

DROP TRIGGER IF EXISTS enrollment_audit_del ON public.course_enrollments;
CREATE TRIGGER enrollment_audit_del
  AFTER DELETE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.tg_enrollment_audit_delete();

-- 3. Widen instructor UPDATE policy is not needed — existing "Instructors can update enrollment status" already permits revoke.
-- Widen student policy to also allow declining a revoked entry not needed. Existing invite policy is fine.

-- 4. Realtime
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.course_enrollments';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_audit_log';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE public.course_enrollments REPLICA IDENTITY FULL;
ALTER TABLE public.enrollment_audit_log REPLICA IDENTITY FULL;
