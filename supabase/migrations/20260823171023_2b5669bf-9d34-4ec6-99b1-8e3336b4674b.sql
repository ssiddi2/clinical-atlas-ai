-- Session plan: reusable 6-step pre-session structure for any learning unit
CREATE TABLE public.learning_unit_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, step_key)
);

CREATE TABLE public.learning_unit_step_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.learning_unit_steps(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  title text,
  subtitle text,
  body text,
  url text,
  source text,
  image_url text,
  duration_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.learning_unit_step_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.learning_unit_steps(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (step_id, student_id)
);

CREATE INDEX idx_lu_steps_topic ON public.learning_unit_steps(topic_id, sort_order);
CREATE INDEX idx_lu_step_items_step ON public.learning_unit_step_items(step_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_unit_steps TO authenticated;
GRANT ALL ON public.learning_unit_steps TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_unit_step_items TO authenticated;
GRANT ALL ON public.learning_unit_step_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_unit_step_progress TO authenticated;
GRANT ALL ON public.learning_unit_step_progress TO service_role;

ALTER TABLE public.learning_unit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_unit_step_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_unit_step_progress ENABLE ROW LEVEL SECURITY;

-- helper: is the signed-in user allowed to read this topic's session plan
CREATE OR REPLACE FUNCTION public.can_view_topic(_topic_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_topics ct
    JOIN public.courses c ON c.id = ct.course_id
    WHERE ct.id = _topic_id
      AND (c.instructor_id = _user_id
        OR EXISTS (SELECT 1 FROM public.course_enrollments ce
                   WHERE ce.course_id = c.id AND ce.student_id = _user_id AND ce.status = 'approved'))
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_topic(_topic_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_topics ct
    JOIN public.courses c ON c.id = ct.course_id
    WHERE ct.id = _topic_id AND c.instructor_id = _user_id
  )
$$;

CREATE POLICY "View session steps" ON public.learning_unit_steps
  FOR SELECT TO authenticated USING (public.can_view_topic(topic_id, auth.uid()));
CREATE POLICY "Instructors manage session steps" ON public.learning_unit_steps
  FOR ALL TO authenticated USING (public.can_edit_topic(topic_id, auth.uid()))
  WITH CHECK (public.can_edit_topic(topic_id, auth.uid()));
CREATE POLICY "Admins manage session steps" ON public.learning_unit_steps
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "View session items" ON public.learning_unit_step_items
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.learning_unit_steps s
    WHERE s.id = step_id AND public.can_view_topic(s.topic_id, auth.uid())));
CREATE POLICY "Instructors manage session items" ON public.learning_unit_step_items
  FOR ALL TO authenticated USING (EXISTS (
    SELECT 1 FROM public.learning_unit_steps s
    WHERE s.id = step_id AND public.can_edit_topic(s.topic_id, auth.uid())))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.learning_unit_steps s
    WHERE s.id = step_id AND public.can_edit_topic(s.topic_id, auth.uid())));
CREATE POLICY "Admins manage session items" ON public.learning_unit_step_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "Students manage own step progress" ON public.learning_unit_step_progress
  FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Instructors view step progress" ON public.learning_unit_step_progress
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.learning_unit_steps s
    WHERE s.id = step_id AND public.can_edit_topic(s.topic_id, auth.uid())));
CREATE POLICY "Admins view step progress" ON public.learning_unit_step_progress
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'::app_role));