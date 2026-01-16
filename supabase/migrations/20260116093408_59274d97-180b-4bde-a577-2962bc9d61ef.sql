-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'physician', 'faculty', 'institutional_admin', 'platform_admin');

-- Create program level enum
CREATE TYPE public.program_level AS ENUM ('pre_clinical', 'clinical', 'residency_prep', 'cme');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  institution TEXT,
  country TEXT,
  program_level program_level DEFAULT 'pre_clinical',
  year_of_study INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Create specialties reference table
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default specialties
INSERT INTO public.specialties (name, description, icon, sort_order) VALUES
  ('Internal Medicine', 'Comprehensive care for adults with complex medical conditions', 'stethoscope', 1),
  ('Surgery', 'Operative procedures and perioperative care', 'activity', 2),
  ('Emergency Medicine', 'Acute care for patients with urgent medical needs', 'alert-circle', 3),
  ('Cardiology', 'Disorders of the heart and cardiovascular system', 'heart', 4),
  ('Pulmonology', 'Disorders of the respiratory system', 'wind', 5),
  ('Neurology', 'Disorders of the nervous system', 'brain', 6),
  ('Gastroenterology', 'Disorders of the digestive system', 'circle', 7),
  ('Nephrology', 'Disorders of the kidneys', 'droplet', 8),
  ('Endocrinology', 'Hormonal and metabolic disorders', 'zap', 9),
  ('Family Medicine', 'Comprehensive primary care for patients of all ages', 'users', 10);

-- Create modules table for curriculum
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id UUID REFERENCES public.specialties(id),
  title TEXT NOT NULL,
  description TEXT,
  program_level program_level NOT NULL,
  sort_order INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  content_type TEXT DEFAULT 'lesson',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_module_progress table
CREATE TABLE public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create ELI conversations table
CREATE TABLE public.eli_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  specialty_id UUID REFERENCES public.specialties(id),
  module_id UUID REFERENCES public.modules(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ELI messages table
CREATE TABLE public.eli_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.eli_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eli_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eli_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage, users can view their own)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'platform_admin'));

-- Specialties are public read
CREATE POLICY "Anyone can view specialties"
  ON public.specialties FOR SELECT
  USING (true);

-- Modules are public read for published modules
CREATE POLICY "Anyone can view published modules"
  ON public.modules FOR SELECT
  USING (is_published = true);

-- User module progress policies
CREATE POLICY "Users can view their own progress"
  ON public.user_module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_module_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ELI conversations policies
CREATE POLICY "Users can view their own conversations"
  ON public.eli_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.eli_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.eli_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.eli_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ELI messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.eli_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.eli_conversations
      WHERE id = eli_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.eli_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.eli_conversations
      WHERE id = eli_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eli_conversations_updated_at
  BEFORE UPDATE ON public.eli_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();