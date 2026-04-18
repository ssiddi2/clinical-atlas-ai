
-- 1) Lock down profiles UPDATE: prevent self-escalation of sensitive fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE OR REPLACE FUNCTION public.profile_self_update_safe(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.user_id = auth.uid()
      -- sensitive fields must remain unchanged on self-update
      AND p.membership_tier IS NOT DISTINCT FROM (SELECT membership_tier FROM public.profiles WHERE user_id = _user_id)
      AND p.account_status IS NOT DISTINCT FROM (SELECT account_status FROM public.profiles WHERE user_id = _user_id)
      AND p.verification_status IS NOT DISTINCT FROM (SELECT verification_status FROM public.profiles WHERE user_id = _user_id)
  )
$$;

-- Use a trigger to enforce immutability of sensitive columns on self-update (more reliable than RLS WITH CHECK comparing OLD/NEW)
CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip enforcement for platform admins
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

DROP TRIGGER IF EXISTS trg_prevent_profile_self_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_self_escalation();

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2) Lock down user_roles: only platform_admin can INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Platform admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role) OR auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

-- 3) Restrict lesson_content + quiz_questions to authenticated users
DROP POLICY IF EXISTS "Anyone can view lesson content" ON public.lesson_content;
CREATE POLICY "Authenticated users can view lesson content"
  ON public.lesson_content
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Authenticated users can view quiz questions"
  ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);
