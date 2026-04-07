
-- Create courses table
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id uuid NOT NULL,
  specialty_id uuid REFERENCES public.specialties(id),
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  max_students integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active courses"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Instructors can create their own courses"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their own courses"
  ON public.courses FOR UPDATE TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their own courses"
  ON public.courses FOR DELETE TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can manage all courses"
  ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  UNIQUE(course_id, student_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own enrollments"
  ON public.course_enrollments FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view enrollments for their courses"
  ON public.course_enrollments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_enrollments.course_id
    AND courses.instructor_id = auth.uid()
  ));

CREATE POLICY "Students can request enrollment"
  ON public.course_enrollments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Instructors can update enrollment status"
  ON public.course_enrollments FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_enrollments.course_id
    AND courses.instructor_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all enrollments"
  ON public.course_enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

-- Create study_plans table
CREATE TABLE public.study_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_from jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study plan"
  ON public.study_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plan"
  ON public.study_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plan"
  ON public.study_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add course_id to virtual_classrooms
ALTER TABLE public.virtual_classrooms
  ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;
