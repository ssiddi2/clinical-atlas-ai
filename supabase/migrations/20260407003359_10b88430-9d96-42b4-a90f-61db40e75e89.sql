
-- Virtual Classrooms table
CREATE TABLE public.virtual_classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  specialty_id UUID REFERENCES public.specialties(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  max_students INT NOT NULL DEFAULT 50,
  meeting_url TEXT,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.virtual_classrooms ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse classrooms
CREATE POLICY "Authenticated users can view classrooms"
  ON public.virtual_classrooms FOR SELECT
  TO authenticated
  USING (true);

-- Instructors can manage their own
CREATE POLICY "Instructors can create their own classrooms"
  ON public.virtual_classrooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their own classrooms"
  ON public.virtual_classrooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their own classrooms"
  ON public.virtual_classrooms FOR DELETE
  TO authenticated
  USING (auth.uid() = instructor_id);

-- Admins can manage all
CREATE POLICY "Admins can manage all classrooms"
  ON public.virtual_classrooms FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

-- Timestamp trigger
CREATE TRIGGER update_virtual_classrooms_updated_at
  BEFORE UPDATE ON public.virtual_classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Classroom Enrollments table
CREATE TABLE public.classroom_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(classroom_id, student_id)
);

ALTER TABLE public.classroom_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their enrollments
CREATE POLICY "Students can view their own enrollments"
  ON public.classroom_enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Instructors can view enrollments for their classrooms
CREATE POLICY "Instructors can view enrollments for their classrooms"
  ON public.classroom_enrollments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.virtual_classrooms
    WHERE id = classroom_enrollments.classroom_id
    AND instructor_id = auth.uid()
  ));

-- Students can enroll themselves
CREATE POLICY "Students can enroll themselves"
  ON public.classroom_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own enrollment
CREATE POLICY "Students can update their own enrollment"
  ON public.classroom_enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments"
  ON public.classroom_enrollments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

-- Update handle_new_user to support signup_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );

  -- Determine role from signup metadata
  IF NEW.raw_user_meta_data ->> 'signup_role' = 'physician' THEN
    _role := 'physician';
  ELSE
    _role := 'student';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$function$;
