
DROP POLICY IF EXISTS "Anyone can submit bounded inquiry" ON public.contact_inquiries;

CREATE POLICY "Anyone can submit bounded inquiry"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) >= 1 AND length(full_name) <= 200
  AND length(email) >= 3 AND length(email) <= 320
  AND email LIKE '%_@_%.__%'
  AND length(message) >= 10 AND length(message) <= 5000
  AND (organization IS NULL OR length(organization) <= 200)
  AND (role IS NULL OR length(role) <= 100)
  AND inquiry_type = ANY (ARRAY['general','application','partnership','press','demo','support','contact','lor_request'])
);

CREATE POLICY "Users can view their own inquiries by email"
ON public.contact_inquiries
FOR SELECT
TO authenticated
USING (email = auth.email());
