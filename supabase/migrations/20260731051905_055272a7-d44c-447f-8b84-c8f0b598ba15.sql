-- 1. Presence / attendance
CREATE TABLE public.classroom_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  accumulated_seconds integer NOT NULL DEFAULT 0,
  hand_raised_at timestamptz,
  called_on_count integer NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT true,
  connection_quality text,
  UNIQUE (classroom_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classroom_presence TO authenticated;
GRANT ALL ON public.classroom_presence TO service_role;
ALTER TABLE public.classroom_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presence_select" ON public.classroom_presence FOR SELECT TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()) OR public.is_classroom_enrolled(classroom_id, auth.uid()));
CREATE POLICY "presence_insert_own" ON public.classroom_presence FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND (public.is_classroom_instructor(classroom_id, auth.uid()) OR public.is_classroom_enrolled(classroom_id, auth.uid())));
CREATE POLICY "presence_update_own" ON public.classroom_presence FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "presence_update_instructor" ON public.classroom_presence FOR UPDATE TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()));
CREATE POLICY "presence_delete_own" ON public.classroom_presence FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_classroom_instructor(classroom_id, auth.uid()));

-- 2. Shared stage
CREATE TABLE public.classroom_stage (
  classroom_id uuid PRIMARY KEY REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'video',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classroom_stage TO authenticated;
GRANT ALL ON public.classroom_stage TO service_role;
ALTER TABLE public.classroom_stage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stage_select" ON public.classroom_stage FOR SELECT TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()) OR public.is_classroom_enrolled(classroom_id, auth.uid()));
CREATE POLICY "stage_write" ON public.classroom_stage FOR ALL TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()))
WITH CHECK (public.is_classroom_instructor(classroom_id, auth.uid()));

CREATE TRIGGER trg_classroom_stage_updated BEFORE UPDATE ON public.classroom_stage
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Whiteboard snapshots
CREATE TABLE public.whiteboard_snapshots (
  classroom_id uuid PRIMARY KEY REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  strokes jsonb NOT NULL DEFAULT '[]'::jsonb,
  background_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whiteboard_snapshots TO authenticated;
GRANT ALL ON public.whiteboard_snapshots TO service_role;
ALTER TABLE public.whiteboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wb_select" ON public.whiteboard_snapshots FOR SELECT TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()) OR public.is_classroom_enrolled(classroom_id, auth.uid()));
CREATE POLICY "wb_write" ON public.whiteboard_snapshots FOR ALL TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()))
WITH CHECK (public.is_classroom_instructor(classroom_id, auth.uid()));

CREATE TRIGGER trg_whiteboard_updated BEFORE UPDATE ON public.whiteboard_snapshots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Live cases
CREATE TABLE public.live_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL,
  title text NOT NULL,
  vignette text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_step_index integer NOT NULL DEFAULT 0,
  revealed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_cases TO authenticated;
GRANT ALL ON public.live_cases TO service_role;
ALTER TABLE public.live_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_select" ON public.live_cases FOR SELECT TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()) OR (status <> 'draft' AND public.is_classroom_enrolled(classroom_id, auth.uid())));
CREATE POLICY "case_write" ON public.live_cases FOR ALL TO authenticated
USING (public.is_classroom_instructor(classroom_id, auth.uid()))
WITH CHECK (public.is_classroom_instructor(classroom_id, auth.uid()));

CREATE TRIGGER trg_live_cases_updated BEFORE UPDATE ON public.live_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.live_case_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.live_cases(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  student_id uuid NOT NULL,
  option_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, step_index, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_case_votes TO authenticated;
GRANT ALL ON public.live_case_votes TO service_role;
ALTER TABLE public.live_case_votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_case_instructor(_case_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.live_cases lc
    JOIN public.virtual_classrooms vc ON vc.id = lc.classroom_id
    WHERE lc.id = _case_id AND vc.instructor_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_case_participant(_case_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.live_cases lc
    JOIN public.classroom_enrollments ce ON ce.classroom_id = lc.classroom_id
    WHERE lc.id = _case_id AND ce.student_id = _user_id
  )
$$;

CREATE POLICY "vote_select" ON public.live_case_votes FOR SELECT TO authenticated
USING (public.is_case_instructor(case_id, auth.uid()) OR public.is_case_participant(case_id, auth.uid()));
CREATE POLICY "vote_insert_own" ON public.live_case_votes FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND public.is_case_participant(case_id, auth.uid()));
CREATE POLICY "vote_update_own" ON public.live_case_votes FOR UPDATE TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 5. Attendance finalization
CREATE OR REPLACE FUNCTION public.finalize_classroom_attendance(_classroom_id uuid, _min_seconds integer DEFAULT 300)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _count integer;
BEGIN
  IF NOT public.is_classroom_instructor(_classroom_id, auth.uid())
     AND NOT public.has_role(auth.uid(), 'platform_admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.classroom_enrollments ce
  SET attended = true
  FROM public.classroom_presence cp
  WHERE cp.classroom_id = _classroom_id
    AND cp.classroom_id = ce.classroom_id
    AND cp.user_id = ce.student_id
    AND cp.accumulated_seconds >= _min_seconds;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- 6. Lesson content authoring for instructors/admins
CREATE POLICY "lesson_content_insert_staff" ON public.lesson_content FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'physician'::app_role) OR public.has_role(auth.uid(), 'faculty'::app_role) OR public.has_role(auth.uid(), 'platform_admin'::app_role));
CREATE POLICY "lesson_content_update_staff" ON public.lesson_content FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'physician'::app_role) OR public.has_role(auth.uid(), 'faculty'::app_role) OR public.has_role(auth.uid(), 'platform_admin'::app_role));
CREATE POLICY "lesson_content_delete_staff" ON public.lesson_content FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_stage;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboard_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_case_votes;
ALTER TABLE public.classroom_presence REPLICA IDENTITY FULL;
ALTER TABLE public.classroom_stage REPLICA IDENTITY FULL;
ALTER TABLE public.whiteboard_snapshots REPLICA IDENTITY FULL;
ALTER TABLE public.live_cases REPLICA IDENTITY FULL;
ALTER TABLE public.live_case_votes REPLICA IDENTITY FULL;