-- Add membership_tier column to profiles
ALTER TABLE public.profiles 
ADD COLUMN membership_tier text NOT NULL DEFAULT 'learner' 
CHECK (membership_tier IN ('learner', 'clinical'));

-- Update existing approved users to learner tier (already default)
UPDATE public.profiles SET membership_tier = 'learner' WHERE membership_tier IS NULL;