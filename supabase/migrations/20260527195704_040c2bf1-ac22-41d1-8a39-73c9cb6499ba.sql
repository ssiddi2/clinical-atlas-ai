-- 1) Tighten public contact_inquiries INSERT to enforce sane bounds and inquiry types
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.contact_inquiries;
CREATE POLICY "Anyone can submit bounded inquiry"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 320
  AND email LIKE '%_@_%.__%'
  AND length(message) BETWEEN 10 AND 5000
  AND (organization IS NULL OR length(organization) <= 200)
  AND (role IS NULL OR length(role) <= 100)
  AND inquiry_type IN ('general','application','partnership','press','demo','support','contact')
);

-- 2) Lock down SECURITY DEFINER helpers
-- Trigger-only functions: revoke from everyone except postgres/service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_self_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role and profile_self_update_safe are referenced by RLS policies on
-- authenticated requests, so keep EXECUTE for authenticated but block anon/public.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.profile_self_update_safe(uuid) FROM PUBLIC, anon;