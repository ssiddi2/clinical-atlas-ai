ALTER TABLE public.rotation_enrollments
  ADD COLUMN IF NOT EXISTS transcript_url text,
  ADD COLUMN IF NOT EXISTS credential_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS credential_verified_by uuid,
  ADD COLUMN IF NOT EXISTS credential_verified_at timestamptz;

CREATE OR REPLACE FUNCTION public.prevent_rotation_self_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'platform_admin'::app_role)
     OR public.has_role(auth.uid(), 'faculty'::app_role)
     OR public.has_role(auth.uid(), 'physician'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.credential_verified IS DISTINCT FROM OLD.credential_verified
     OR NEW.credential_verified_by IS DISTINCT FROM OLD.credential_verified_by
     OR NEW.credential_verified_at IS DISTINCT FROM OLD.credential_verified_at
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     OR NEW.reviewer_notes IS DISTINCT FROM OLD.reviewer_notes
     OR NEW.evaluation_score IS DISTINCT FROM OLD.evaluation_score
     OR NEW.physician_comments IS DISTINCT FROM OLD.physician_comments THEN
    RAISE EXCEPTION 'Not allowed to modify review or verification fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_rotation_self_review ON public.rotation_enrollments;
CREATE TRIGGER trg_prevent_rotation_self_review
BEFORE UPDATE ON public.rotation_enrollments
FOR EACH ROW EXECUTE FUNCTION public.prevent_rotation_self_review();

CREATE OR REPLACE FUNCTION public.prevent_rotation_self_verified_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT (public.has_role(auth.uid(), 'platform_admin'::app_role)
              OR public.has_role(auth.uid(), 'faculty'::app_role)
              OR public.has_role(auth.uid(), 'physician'::app_role)) THEN
    NEW.credential_verified := false;
    NEW.credential_verified_by := NULL;
    NEW.credential_verified_at := NULL;
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
    NEW.reviewer_notes := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_rotation_self_verified_insert ON public.rotation_enrollments;
CREATE TRIGGER trg_prevent_rotation_self_verified_insert
BEFORE INSERT ON public.rotation_enrollments
FOR EACH ROW EXECUTE FUNCTION public.prevent_rotation_self_verified_insert();