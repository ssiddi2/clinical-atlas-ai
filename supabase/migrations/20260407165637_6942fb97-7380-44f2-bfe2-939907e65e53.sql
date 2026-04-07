
-- Course Topics (Curriculum Builder)
CREATE TABLE public.course_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  parent_topic_id UUID REFERENCES public.course_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_high_yield BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage their course topics"
ON public.course_topics FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM courses WHERE courses.id = course_topics.course_id AND courses.instructor_id = auth.uid()
));

CREATE POLICY "Enrolled students can view course topics"
ON public.course_topics FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM course_enrollments
  WHERE course_enrollments.course_id = course_topics.course_id
    AND course_enrollments.student_id = auth.uid()
    AND course_enrollments.status = 'approved'
));

CREATE POLICY "Admins can manage all topics"
ON public.course_topics FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'::app_role));

CREATE TRIGGER update_course_topics_updated_at
BEFORE UPDATE ON public.course_topics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Course Quiz Attempts
CREATE TABLE public.course_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create their own attempts"
ON public.course_quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own attempts"
ON public.course_quiz_attempts FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view attempts for their courses"
ON public.course_quiz_attempts FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM course_quizzes cq
  JOIN courses c ON c.id = cq.course_id
  WHERE cq.id = course_quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Admins can view all attempts"
ON public.course_quiz_attempts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'::app_role));

-- Add topic_id to course_quizzes
ALTER TABLE public.course_quizzes ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.course_topics(id) ON DELETE SET NULL;

-- Add topic_id to virtual_classrooms
ALTER TABLE public.virtual_classrooms ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.course_topics(id) ON DELETE SET NULL;

-- Add topic_id to course_materials
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.course_topics(id) ON DELETE SET NULL;
