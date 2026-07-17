-- Notify instructors when a student responds to their course invitation (accept/decline/revoke self)
CREATE OR REPLACE FUNCTION public.tg_notify_instructor_on_invite_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _instructor uuid;
  _course_title text;
  _student_name text;
  _title text;
  _msg text;
  _type text;
BEGIN
  -- Only fire when transitioning out of 'invited' via student action
  IF OLD.status <> 'invited' THEN
    RETURN NEW;
  END IF;
  IF NEW.status NOT IN ('approved','declined') THEN
    RETURN NEW;
  END IF;

  SELECT c.instructor_id, c.title INTO _instructor, _course_title
  FROM public.courses c WHERE c.id = NEW.course_id;

  IF _instructor IS NULL OR _instructor = NEW.student_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''), 'A student')
    INTO _student_name
  FROM public.profiles p WHERE p.user_id = NEW.student_id;

  IF NEW.status = 'approved' THEN
    _type := 'success';
    _title := 'Invitation accepted';
    _msg := COALESCE(_student_name,'A student') || ' accepted your invitation to ' || _course_title || '.';
  ELSE
    _type := 'warning';
    _title := 'Invitation declined';
    _msg := COALESCE(_student_name,'A student') || ' declined your invitation to ' || _course_title || '.';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (_instructor, _type, _title, _msg, '/courses/' || NEW.course_id::text);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_instructor_on_invite_response ON public.course_enrollments;
CREATE TRIGGER trg_notify_instructor_on_invite_response
AFTER UPDATE OF status ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.tg_notify_instructor_on_invite_response();