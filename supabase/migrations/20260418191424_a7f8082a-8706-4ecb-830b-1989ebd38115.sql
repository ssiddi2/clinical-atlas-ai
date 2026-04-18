
CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role / no-auth context (edge functions using service key) is allowed
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Platform admins are allowed
  IF public.has_role(auth.uid(), 'platform_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.membership_tier IS DISTINCT FROM OLD.membership_tier THEN
    RAISE EXCEPTION 'Not allowed to change membership_tier';
  END IF;
  IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
    RAISE EXCEPTION 'Not allowed to change account_status';
  END IF;
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'Not allowed to change verification_status';
  END IF;
  RETURN NEW;
END;
$$;
