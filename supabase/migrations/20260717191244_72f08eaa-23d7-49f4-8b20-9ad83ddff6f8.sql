
-- Helper: fan out a notification to every approved enrollee of a course
CREATE OR REPLACE FUNCTION public.notify_course_enrollees(
  _course_id uuid,
  _type text,
  _title text,
  _message text,
  _link text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT ce.student_id, _type, _title, _message, _link
  FROM public.course_enrollments ce
  WHERE ce.course_id = _course_id
    AND ce.status = 'approved';
END;
$$;

-- Virtual classrooms: insert / status change / reschedule
CREATE OR REPLACE FUNCTION public.tg_notify_virtual_classroom()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _title text;
  _message text;
  _type text := 'info';
BEGIN
  IF TG_OP = 'INSERT' THEN
    _title := 'New lecture scheduled';
    _message := NEW.title || ' — ' || to_char(NEW.scheduled_start AT TIME ZONE 'UTC', 'Mon DD, HH24:MI') || ' UTC';
    PERFORM public.notify_course_enrollees(NEW.course_id, _type, _title, _message, '/virtual-classroom');
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'live' AND OLD.status IS DISTINCT FROM 'live' THEN
      _title := 'Lecture is live now';
      _message := NEW.title || ' — join your instructor';
      PERFORM public.notify_course_enrollees(NEW.course_id, 'success', _title, _message, '/virtual-classroom');
    ELSIF NEW.scheduled_start IS DISTINCT FROM OLD.scheduled_start THEN
      _title := 'Lecture rescheduled';
      _message := NEW.title || ' — new time: ' || to_char(NEW.scheduled_start AT TIME ZONE 'UTC', 'Mon DD, HH24:MI') || ' UTC';
      PERFORM public.notify_course_enrollees(NEW.course_id, 'info', _title, _message, '/virtual-classroom');
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_virtual_classroom_insert ON public.virtual_classrooms;
CREATE TRIGGER notify_virtual_classroom_insert
AFTER INSERT ON public.virtual_classrooms
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_virtual_classroom();

DROP TRIGGER IF EXISTS notify_virtual_classroom_update ON public.virtual_classrooms;
CREATE TRIGGER notify_virtual_classroom_update
AFTER UPDATE ON public.virtual_classrooms
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_virtual_classroom();

-- Course materials
CREATE OR REPLACE FUNCTION public.tg_notify_course_material()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_course_enrollees(
    NEW.course_id,
    'info',
    'New course material',
    COALESCE(NEW.title, 'Your instructor added new material'),
    '/courses/' || NEW.course_id::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_course_material_insert ON public.course_materials;
CREATE TRIGGER notify_course_material_insert
AFTER INSERT ON public.course_materials
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_course_material();

-- Course quizzes
CREATE OR REPLACE FUNCTION public.tg_notify_course_quiz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_course_enrollees(
    NEW.course_id,
    'info',
    'New quiz available',
    COALESCE(NEW.title, 'Your instructor posted a new quiz'),
    '/courses/' || NEW.course_id::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_course_quiz_insert ON public.course_quizzes;
CREATE TRIGGER notify_course_quiz_insert
AFTER INSERT ON public.course_quizzes
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_course_quiz();

-- Enable realtime on notifications so the bell updates instantly
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;
