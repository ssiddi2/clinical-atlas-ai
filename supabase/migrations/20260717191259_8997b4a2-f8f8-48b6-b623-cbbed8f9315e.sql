
REVOKE EXECUTE ON FUNCTION public.notify_course_enrollees(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_virtual_classroom() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_course_material() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_course_quiz() FROM PUBLIC, anon, authenticated;
