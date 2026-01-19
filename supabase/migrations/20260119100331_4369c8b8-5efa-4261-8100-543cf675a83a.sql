-- Add policy for admins to view contact inquiries
CREATE POLICY "Admins can view all contact inquiries" 
ON public.contact_inquiries 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));