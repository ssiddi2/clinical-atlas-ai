-- 1. Live reactions / confusion meter
CREATE TABLE public.live_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('got_it','confused','slow_down')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_live_reactions_classroom_time ON public.live_reactions(classroom_id, created_at DESC);
ALTER TABLE public.live_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students send reactions"
ON public.live_reactions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM virtual_classrooms vc
    JOIN course_enrollments ce ON ce.course_id = vc.course_id
    WHERE vc.id = live_reactions.classroom_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'approved'
  )
);

CREATE POLICY "Instructors view reactions for their classrooms"
ON public.live_reactions FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM virtual_classrooms vc WHERE vc.id = live_reactions.classroom_id AND vc.instructor_id = auth.uid())
);

CREATE POLICY "Students view their own reactions"
ON public.live_reactions FOR SELECT TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Admins full access reactions"
ON public.live_reactions FOR ALL TO authenticated
USING (has_role(auth.uid(),'platform_admin'::app_role))
WITH CHECK (has_role(auth.uid(),'platform_admin'::app_role));

-- 2. Confidence ratings on live quiz responses
ALTER TABLE public.live_quiz_responses
  ADD COLUMN IF NOT EXISTS confidence_percent integer
  CHECK (confidence_percent IS NULL OR (confidence_percent >= 0 AND confidence_percent <= 100));

-- 3. ATLAS co-pilot questions during a lecture
CREATE TABLE public.lecture_copilot_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  question text NOT NULL,
  answer text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','answered','error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz
);
CREATE INDEX idx_copilot_classroom_time ON public.lecture_copilot_questions(classroom_id, created_at DESC);
ALTER TABLE public.lecture_copilot_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students ask copilot questions"
ON public.lecture_copilot_questions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM virtual_classrooms vc
    JOIN course_enrollments ce ON ce.course_id = vc.course_id
    WHERE vc.id = lecture_copilot_questions.classroom_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'approved'
  )
);

CREATE POLICY "Students view their own copilot questions"
ON public.lecture_copilot_questions FOR SELECT TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Instructors view copilot questions for their classrooms"
ON public.lecture_copilot_questions FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM virtual_classrooms vc WHERE vc.id = lecture_copilot_questions.classroom_id AND vc.instructor_id = auth.uid())
);

-- Edge function updates answer/status (uses service role); also allow students to update their own (e.g., if client writes back)
CREATE POLICY "Students update their own copilot questions"
ON public.lecture_copilot_questions FOR UPDATE TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Admins full access copilot"
ON public.lecture_copilot_questions FOR ALL TO authenticated
USING (has_role(auth.uid(),'platform_admin'::app_role))
WITH CHECK (has_role(auth.uid(),'platform_admin'::app_role));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lecture_copilot_questions;
ALTER TABLE public.live_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.lecture_copilot_questions REPLICA IDENTITY FULL;