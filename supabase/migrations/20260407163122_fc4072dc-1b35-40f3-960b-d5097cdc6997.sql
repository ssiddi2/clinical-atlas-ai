
-- Table: course_materials
CREATE TABLE public.course_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'application/pdf',
  material_type text NOT NULL DEFAULT 'notes',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all materials"
  ON public.course_materials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "Instructors can manage their course materials"
  ON public.course_materials FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_materials.course_id
      AND courses.instructor_id = auth.uid()
  ));

CREATE POLICY "Enrolled students can view course materials"
  ON public.course_materials FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE course_enrollments.course_id = course_materials.course_id
      AND course_enrollments.student_id = auth.uid()
      AND course_enrollments.status = 'approved'
  ));

-- Table: course_quizzes
CREATE TABLE public.course_quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all quizzes"
  ON public.course_quizzes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "Instructors can manage their course quizzes"
  ON public.course_quizzes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_quizzes.course_id
      AND courses.instructor_id = auth.uid()
  ));

CREATE POLICY "Enrolled students can view published quizzes"
  ON public.course_quizzes FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.course_id = course_quizzes.course_id
        AND course_enrollments.student_id = auth.uid()
        AND course_enrollments.status = 'approved'
    )
  );

CREATE TRIGGER update_course_quizzes_updated_at
  BEFORE UPDATE ON public.course_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table: notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Storage bucket: course-materials (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false);

CREATE POLICY "Instructors can upload course materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id::text = (storage.foldername(name))[1]
        AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete course materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id::text = (storage.foldername(name))[1]
        AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view their course materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id::text = (storage.foldername(name))[1]
        AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled students can download course materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.course_id::text = (storage.foldername(name))[1]
        AND course_enrollments.student_id = auth.uid()
        AND course_enrollments.status = 'approved'
    )
  );
