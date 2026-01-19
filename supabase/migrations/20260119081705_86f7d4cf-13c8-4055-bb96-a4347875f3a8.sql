-- Allow platform admins to view all profiles for verification purposes
CREATE POLICY "Admins can view all profiles for verification"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'platform_admin'));