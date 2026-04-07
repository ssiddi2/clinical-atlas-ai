-- Learning Unit Content
CREATE TABLE public.learning_unit_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  explanation text DEFAULT '',
  quick_notes text DEFAULT '',
  exam_traps text DEFAULT '',
  instructor_note text DEFAULT '',
  is_high_yield boolean DEFAULT false,
  is_important boolean DEFAULT false,
  is_exam_focus boolean DEFAULT false,
  status text DEFAULT 'draft',
  passing_score integer DEFAULT 70,
  require_quiz_before_next boolean DEFAULT false,
  allow_retry boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(topic_id)
);

ALTER TABLE public.learning_unit_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on learning_unit_content"
  ON public.learning_unit_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Instructors manage their learning unit content"
  ON public.learning_unit_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_topics ct
      JOIN public.courses c ON c.id = ct.course_id
      WHERE ct.id = learning_unit_content.topic_id
        AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled students can view learning unit content"
  ON public.learning_unit_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_topics ct
      JOIN public.course_enrollments ce ON ce.course_id = ct.course_id
      WHERE ct.id = learning_unit_content.topic_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'approved'
    )
  );

CREATE TRIGGER update_learning_unit_content_updated_at
  BEFORE UPDATE ON public.learning_unit_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Learning Unit Questions
CREATE TABLE public.learning_unit_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  stem text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer_index integer NOT NULL DEFAULT 0,
  explanation text DEFAULT '',
  difficulty text DEFAULT 'medium',
  concept_tag text DEFAULT '',
  exam_relevance text DEFAULT 'medium',
  created_by uuid NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.learning_unit_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on learning_unit_questions"
  ON public.learning_unit_questions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Instructors manage their learning unit questions"
  ON public.learning_unit_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_topics ct
      JOIN public.courses c ON c.id = ct.course_id
      WHERE ct.id = learning_unit_questions.topic_id
        AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled students can view learning unit questions"
  ON public.learning_unit_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_topics ct
      JOIN public.course_enrollments ce ON ce.course_id = ct.course_id
      WHERE ct.id = learning_unit_questions.topic_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'approved'
    )
  );

-- Learning Unit Progress
CREATE TABLE public.learning_unit_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  topic_id uuid NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  quiz_score integer,
  quiz_answers jsonb DEFAULT '[]',
  time_spent_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, topic_id)
);

ALTER TABLE public.learning_unit_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on learning_unit_progress"
  ON public.learning_unit_progress FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Instructors can view progress for their courses"
  ON public.learning_unit_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_topics ct
      JOIN public.courses c ON c.id = ct.course_id
      WHERE ct.id = learning_unit_progress.topic_id
        AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own progress"
  ON public.learning_unit_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress"
  ON public.learning_unit_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress"
  ON public.learning_unit_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE TRIGGER update_learning_unit_progress_updated_at
  BEFORE UPDATE ON public.learning_unit_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();