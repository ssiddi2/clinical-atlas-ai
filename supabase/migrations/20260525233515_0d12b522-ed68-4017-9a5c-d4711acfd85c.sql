
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_profile JSONB,
  ADD COLUMN IF NOT EXISTS learning_assessment_completed BOOLEAN NOT NULL DEFAULT false;
