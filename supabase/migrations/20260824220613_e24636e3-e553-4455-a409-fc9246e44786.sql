-- 1. Card groups
CREATE TABLE public.card_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'primary',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_groups TO authenticated;
GRANT ALL ON public.card_groups TO service_role;
ALTER TABLE public.card_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own card groups" ON public.card_groups
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_card_groups_updated_at BEFORE UPDATE ON public.card_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.student_card_state
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.card_groups(id) ON DELETE SET NULL;

-- 2. Study guides
CREATE TABLE public.study_guides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  card_key text,
  card_type text,
  topic_id uuid REFERENCES public.course_topics(id) ON DELETE SET NULL,
  title text NOT NULL,
  subject text,
  focus_areas text[] NOT NULL DEFAULT '{}',
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ready',
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_guides TO authenticated;
GRANT ALL ON public.study_guides TO service_role;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own study guides" ON public.study_guides
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_study_guides_updated_at BEFORE UPDATE ON public.study_guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_study_guides_user ON public.study_guides (user_id, created_at DESC);

-- 3. Drills launched from a guide
CREATE TABLE public.guide_drills (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  guide_id uuid REFERENCES public.study_guides(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'study_guide',
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  question_ids uuid[] NOT NULL DEFAULT '{}',
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_count integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_drills TO authenticated;
GRANT ALL ON public.guide_drills TO service_role;
ALTER TABLE public.guide_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own guide drills" ON public.guide_drills
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_guide_drills_updated_at BEFORE UPDATE ON public.guide_drills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Post-lecture debriefs
CREATE TABLE public.lecture_debriefs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  summary text,
  weak_concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz_score integer,
  attendance_seconds integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (classroom_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lecture_debriefs TO authenticated;
GRANT ALL ON public.lecture_debriefs TO service_role;
ALTER TABLE public.lecture_debriefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own lecture debriefs" ON public.lecture_debriefs
  FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Instructors view lecture debriefs" ON public.lecture_debriefs
  FOR SELECT TO authenticated USING (public.is_classroom_instructor(classroom_id, auth.uid()));
CREATE TRIGGER update_lecture_debriefs_updated_at BEFORE UPDATE ON public.lecture_debriefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();