-- Expand profiles table with comprehensive student information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state_province text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS expected_graduation date,
ADD COLUMN IF NOT EXISTS medical_school_type text,
ADD COLUMN IF NOT EXISTS usmle_step1_status text,
ADD COLUMN IF NOT EXISTS usmle_step1_score integer,
ADD COLUMN IF NOT EXISTS usmle_step2_status text,
ADD COLUMN IF NOT EXISTS usmle_step2_score integer,
ADD COLUMN IF NOT EXISTS target_specialty text,
ADD COLUMN IF NOT EXISTS study_hours_per_week integer,
ADD COLUMN IF NOT EXISTS learning_style text,
ADD COLUMN IF NOT EXISTS weak_areas text[],
ADD COLUMN IF NOT EXISTS career_goals text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Create student_documents table for verification documents
CREATE TABLE public.student_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  status text NOT NULL DEFAULT 'pending'
);

-- Enable RLS on student_documents
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view their own documents"
ON public.student_documents
FOR SELECT
USING (auth.uid() = user_id);

-- Users can upload their own documents
CREATE POLICY "Users can upload their own documents"
ON public.student_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Platform admins can view all documents for verification
CREATE POLICY "Admins can view all documents"
ON public.student_documents
FOR SELECT
USING (has_role(auth.uid(), 'platform_admin'));

-- Platform admins can update document status
CREATE POLICY "Admins can update document status"
ON public.student_documents
FOR UPDATE
USING (has_role(auth.uid(), 'platform_admin'));

-- Create onboarding_conversations table to track AI conversations
CREATE TABLE public.onboarding_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_step text DEFAULT 'welcome',
  extracted_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on onboarding_conversations
ALTER TABLE public.onboarding_conversations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own onboarding conversations
CREATE POLICY "Users can view their own onboarding"
ON public.onboarding_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding"
ON public.onboarding_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
ON public.onboarding_conversations
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on onboarding_conversations
CREATE TRIGGER update_onboarding_conversations_updated_at
BEFORE UPDATE ON public.onboarding_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for student documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for student documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all student documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND has_role(auth.uid(), 'platform_admin')
);