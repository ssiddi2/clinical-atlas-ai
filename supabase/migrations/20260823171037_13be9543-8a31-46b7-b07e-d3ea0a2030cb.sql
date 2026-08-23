REVOKE EXECUTE ON FUNCTION public.can_view_topic(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_edit_topic(uuid, uuid) FROM anon, authenticated;