-- Create lesson_content table for real lesson materials
CREATE TABLE public.lesson_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 0,
  section_title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'key_points', 'clinical_pearl')),
  content_text TEXT,
  media_url TEXT,
  media_caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table for real quiz content
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rotation_sessions table for live telemedicine rounds
CREATE TABLE public.rotation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  specialty_id UUID REFERENCES public.specialties(id),
  physician_name TEXT NOT NULL,
  physician_credentials TEXT,
  physician_institution TEXT,
  physician_avatar_url TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  meeting_url TEXT,
  max_participants INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rotation_enrollments table for session enrollment
CREATE TABLE public.rotation_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.rotation_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  attendance_minutes INTEGER,
  feedback TEXT,
  evaluation_score INTEGER CHECK (evaluation_score >= 1 AND evaluation_score <= 5),
  physician_comments TEXT,
  UNIQUE(session_id, user_id)
);

-- Create rotation_case_notes table for documenting cases during sessions
CREATE TABLE public.rotation_case_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.rotation_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  chief_complaint TEXT,
  assessment TEXT,
  plan TEXT,
  learning_points TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotation_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotation_case_notes ENABLE ROW LEVEL SECURITY;

-- Lesson content: Anyone can view (public educational content)
CREATE POLICY "Anyone can view lesson content" ON public.lesson_content
  FOR SELECT USING (true);

-- Quiz questions: Anyone can view
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions
  FOR SELECT USING (true);

-- Rotation sessions: Anyone can view upcoming/live sessions
CREATE POLICY "Anyone can view rotation sessions" ON public.rotation_sessions
  FOR SELECT USING (true);

-- Rotation enrollments: Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments" ON public.rotation_enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Rotation enrollments: Users can enroll themselves
CREATE POLICY "Users can enroll themselves" ON public.rotation_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rotation enrollments: Users can update their own enrollments (for feedback)
CREATE POLICY "Users can update their own enrollments" ON public.rotation_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Rotation case notes: Users can view their own notes
CREATE POLICY "Users can view their own case notes" ON public.rotation_case_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Rotation case notes: Users can create their own notes
CREATE POLICY "Users can create their own case notes" ON public.rotation_case_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rotation case notes: Users can update their own notes
CREATE POLICY "Users can update their own case notes" ON public.rotation_case_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_lesson_content_updated_at
  BEFORE UPDATE ON public.lesson_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rotation_sessions_updated_at
  BEFORE UPDATE ON public.rotation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rotation_case_notes_updated_at
  BEFORE UPDATE ON public.rotation_case_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();