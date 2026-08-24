CREATE TABLE public.medical_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  teaching_caption text,
  image_url text NOT NULL,
  source_page_url text,
  credit text,
  license text,
  modality text,
  body_region text,
  topic_tags text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  specialty_id uuid REFERENCES public.specialties(id),
  status text NOT NULL DEFAULT 'pending',
  suggested_by uuid,
  suggested_query text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  review_notes text,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medical_media_status_check CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT medical_media_image_url_unique UNIQUE (image_url)
);

GRANT SELECT, INSERT, UPDATE ON public.medical_media TO authenticated;
GRANT DELETE ON public.medical_media TO authenticated;
GRANT ALL ON public.medical_media TO service_role;

ALTER TABLE public.medical_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved media is viewable by signed-in users"
ON public.medical_media FOR SELECT TO authenticated
USING (status = 'approved');

CREATE POLICY "Faculty and admins can view all media"
ON public.medical_media FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'physician')
  OR public.has_role(auth.uid(), 'faculty')
  OR public.has_role(auth.uid(), 'platform_admin')
);

CREATE POLICY "Signed-in users can suggest pending media"
ON public.medical_media FOR INSERT TO authenticated
WITH CHECK (status = 'pending' AND suggested_by = auth.uid());

CREATE POLICY "Faculty and admins can review media"
ON public.medical_media FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'physician')
  OR public.has_role(auth.uid(), 'faculty')
  OR public.has_role(auth.uid(), 'platform_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'physician')
  OR public.has_role(auth.uid(), 'faculty')
  OR public.has_role(auth.uid(), 'platform_admin')
);

CREATE POLICY "Platform admins can delete media"
ON public.medical_media FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE INDEX medical_media_status_idx ON public.medical_media (status);
CREATE INDEX medical_media_keywords_idx ON public.medical_media USING gin (keywords);
CREATE INDEX medical_media_topic_tags_idx ON public.medical_media USING gin (topic_tags);

CREATE TRIGGER update_medical_media_updated_at
BEFORE UPDATE ON public.medical_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();