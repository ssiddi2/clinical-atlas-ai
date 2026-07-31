REVOKE EXECUTE ON FUNCTION public.is_case_instructor(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_case_participant(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.finalize_classroom_attendance(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_case_instructor(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_case_participant(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.finalize_classroom_attendance(uuid, integer) TO authenticated, service_role;