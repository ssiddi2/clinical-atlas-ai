-- Add account_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_status text DEFAULT 'pending_approval';

-- Add check constraint for valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_account_status_check 
CHECK (account_status IN ('pending_approval', 'approved', 'suspended'));

-- Set existing users to approved (so current admin can still access)
UPDATE public.profiles SET account_status = 'approved' WHERE user_id IS NOT NULL;

-- Allow admins to update account_status on any profile
CREATE POLICY "Admins can update account status"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'platform_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'platform_admin'::app_role));