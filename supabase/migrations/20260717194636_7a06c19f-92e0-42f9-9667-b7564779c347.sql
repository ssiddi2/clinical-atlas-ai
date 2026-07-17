CREATE OR REPLACE FUNCTION public.tg_notify_virtual_classroom()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _title text;
  _message text;
  _link text;
BEGIN
  _link := '/virtual-classroom?lectureId=' || NEW.id::text;

  IF TG_OP = 'INSERT' THEN
    _title := 'New lecture scheduled';
    _message := NEW.title || ' — ' || to_char(NEW.scheduled_start AT TIME ZONE 'UTC', 'Mon DD, HH24:MI') || ' UTC';
    PERFORM public.notify_course_enrollees(NEW.course_id, 'info', _title, _message, _link);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'live' AND OLD.status IS DISTINCT FROM 'live' THEN
      _title := 'Lecture is live now';
      _message := NEW.title || ' — join your instructor';
      PERFORM public.notify_course_enrollees(NEW.course_id, 'success', _title, _message, _link);
    ELSIF NEW.scheduled_start IS DISTINCT FROM OLD.scheduled_start THEN
      _title := 'Lecture rescheduled';
      _message := NEW.title || ' — new time: ' || to_char(NEW.scheduled_start AT TIME ZONE 'UTC', 'Mon DD, HH24:MI') || ' UTC';
      PERFORM public.notify_course_enrollees(NEW.course_id, 'info', _title, _message, _link);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;