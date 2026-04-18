
-- live_quizzes table
CREATE TABLE public.live_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  topic_hint TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  launched_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_quizzes_classroom ON public.live_quizzes(classroom_id);
CREATE INDEX idx_live_quizzes_status ON public.live_quizzes(status);

ALTER TABLE public.live_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors manage their live quizzes"
  ON public.live_quizzes FOR ALL TO authenticated
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Enrolled students view live quizzes"
  ON public.live_quizzes FOR SELECT TO authenticated
  USING (
    status IN ('live', 'closed')
    AND EXISTS (
      SELECT 1 FROM public.virtual_classrooms vc
      JOIN public.course_enrollments ce ON ce.course_id = vc.course_id
      WHERE vc.id = live_quizzes.classroom_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'approved'
    )
  );

CREATE POLICY "Admins full access live_quizzes"
  ON public.live_quizzes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

-- live_quiz_responses table
CREATE TABLE public.live_quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.live_quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  question_index INTEGER NOT NULL,
  selected_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, student_id, question_index)
);

CREATE INDEX idx_live_quiz_responses_quiz ON public.live_quiz_responses(quiz_id);
CREATE INDEX idx_live_quiz_responses_student ON public.live_quiz_responses(student_id);

ALTER TABLE public.live_quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students submit own responses"
  ON public.live_quiz_responses FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.live_quizzes lq
      WHERE lq.id = live_quiz_responses.quiz_id AND lq.status = 'live'
    )
  );

CREATE POLICY "Students view own responses"
  ON public.live_quiz_responses FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Instructors view all responses for their quizzes"
  ON public.live_quiz_responses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_quizzes lq
      WHERE lq.id = live_quiz_responses.quiz_id
        AND lq.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins full access responses"
  ON public.live_quiz_responses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

-- Trigger to update updated_at
CREATE TRIGGER trg_live_quizzes_updated
  BEFORE UPDATE ON public.live_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.live_quizzes REPLICA IDENTITY FULL;
ALTER TABLE public.live_quiz_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_quiz_responses;
