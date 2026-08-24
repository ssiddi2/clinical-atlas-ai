CREATE TABLE public.atlas_artifacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  conversation_id uuid REFERENCES public.eli_conversations(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'image' CHECK (kind IN ('image','link','note')),
  title text NOT NULL,
  caption text,
  image_url text,
  source_url text,
  credit text,
  license text,
  source_query text,
  context_excerpt text,
  topic_tags text[] NOT NULL DEFAULT '{}',
  faculty_verified boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  session_count integer NOT NULL DEFAULT 0,
  last_studied_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX atlas_artifacts_user_asset_key
  ON public.atlas_artifacts (user_id, COALESCE(image_url, source_url, title));
CREATE INDEX atlas_artifacts_user_created_idx
  ON public.atlas_artifacts (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atlas_artifacts TO authenticated;
GRANT ALL ON public.atlas_artifacts TO service_role;

ALTER TABLE public.atlas_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own artifacts"
  ON public.atlas_artifacts FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Platform admins can view all artifacts"
  ON public.atlas_artifacts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

CREATE TRIGGER update_atlas_artifacts_updated_at
  BEFORE UPDATE ON public.atlas_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.study_guides
  ADD COLUMN IF NOT EXISTS artifact_id uuid REFERENCES public.atlas_artifacts(id) ON DELETE SET NULL;