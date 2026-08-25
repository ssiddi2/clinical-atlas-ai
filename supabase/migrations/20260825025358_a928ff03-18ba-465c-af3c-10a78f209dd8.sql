-- ============================================================
-- Curriculum standards spine: source registry + USMLE Step 2 CK
-- blueprint + ACGME competencies + content mapping
-- ============================================================

-- 1) Approved source registry -------------------------------------------------
CREATE TABLE public.content_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  publisher text,
  domain text NOT NULL,
  url text,
  source_type text NOT NULL DEFAULT 'reference',
  authority_tier smallint NOT NULL DEFAULT 2,
  license text,
  allowed_for_retrieval boolean NOT NULL DEFAULT false,
  citation_format text,
  notes text,
  status text NOT NULL DEFAULT 'approved',
  added_by uuid,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT content_sources_domain_key UNIQUE (domain),
  CONSTRAINT content_sources_tier_chk CHECK (authority_tier BETWEEN 1 AND 4),
  CONSTRAINT content_sources_status_chk CHECK (status IN ('approved','pending','rejected','retired')),
  CONSTRAINT content_sources_type_chk CHECK (source_type IN ('exam_blueprint','guideline','textbook','peer_reviewed','reference','image_library','internal','other'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_sources TO authenticated;
GRANT ALL ON public.content_sources TO service_role;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read approved sources"
  ON public.content_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty and admins can add sources"
  ON public.content_sources FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'platform_admin')
    OR public.has_role(auth.uid(), 'faculty')
    OR public.has_role(auth.uid(), 'physician')
  );
CREATE POLICY "Admins can update sources"
  ON public.content_sources FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Admins can delete sources"
  ON public.content_sources FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER update_content_sources_updated_at
  BEFORE UPDATE ON public.content_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) USMLE blueprint taxonomy (category structure only, cited to USMLE) -------
CREATE TABLE public.usmle_blueprint_nodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam text NOT NULL DEFAULT 'step2ck',
  axis text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  parent_id uuid REFERENCES public.usmle_blueprint_nodes(id) ON DELETE CASCADE,
  weight_low numeric,
  weight_high numeric,
  sort_order integer NOT NULL DEFAULT 0,
  source_id uuid REFERENCES public.content_sources(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usmle_blueprint_nodes_key UNIQUE (exam, axis, code),
  CONSTRAINT usmle_blueprint_axis_chk CHECK (axis IN ('system','discipline','physician_task','competency')),
  CONSTRAINT usmle_blueprint_exam_chk CHECK (exam IN ('step1','step2ck','step3'))
);

GRANT SELECT ON public.usmle_blueprint_nodes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.usmle_blueprint_nodes TO authenticated;
GRANT ALL ON public.usmle_blueprint_nodes TO service_role;
ALTER TABLE public.usmle_blueprint_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read the blueprint"
  ON public.usmle_blueprint_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage the blueprint"
  ON public.usmle_blueprint_nodes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER update_usmle_blueprint_nodes_updated_at
  BEFORE UPDATE ON public.usmle_blueprint_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) ACGME competencies -------------------------------------------------------
CREATE TABLE public.acgme_competencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  parent_id uuid REFERENCES public.acgme_competencies(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  source_id uuid REFERENCES public.content_sources(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.acgme_competencies TO authenticated;
GRANT ALL ON public.acgme_competencies TO service_role;
ALTER TABLE public.acgme_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read competencies"
  ON public.acgme_competencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage competencies"
  ON public.acgme_competencies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER update_acgme_competencies_updated_at
  BEFORE UPDATE ON public.acgme_competencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Content -> blueprint / competency / source mapping -----------------------
CREATE TABLE public.content_blueprint_map (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL,
  content_id text NOT NULL,
  blueprint_node_id uuid REFERENCES public.usmle_blueprint_nodes(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES public.acgme_competencies(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.content_sources(id) ON DELETE SET NULL,
  source_citation text,
  confidence text NOT NULL DEFAULT 'faculty',
  mapped_by uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT content_blueprint_map_type_chk CHECK (content_type IN ('qbank_question','learning_unit_question','course_topic','learning_unit_content','course_quiz','medical_media','module','study_guide')),
  CONSTRAINT content_blueprint_map_confidence_chk CHECK (confidence IN ('faculty','ai_suggested','imported')),
  CONSTRAINT content_blueprint_map_target_chk CHECK (blueprint_node_id IS NOT NULL OR competency_id IS NOT NULL OR source_id IS NOT NULL)
);

CREATE UNIQUE INDEX content_blueprint_map_unique
  ON public.content_blueprint_map (content_type, content_id, COALESCE(blueprint_node_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(competency_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(source_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX content_blueprint_map_content_idx ON public.content_blueprint_map (content_type, content_id);
CREATE INDEX content_blueprint_map_node_idx ON public.content_blueprint_map (blueprint_node_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_blueprint_map TO authenticated;
GRANT ALL ON public.content_blueprint_map TO service_role;
ALTER TABLE public.content_blueprint_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read content mappings"
  ON public.content_blueprint_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty and admins can create mappings"
  ON public.content_blueprint_map FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'platform_admin')
    OR public.has_role(auth.uid(), 'faculty')
    OR public.has_role(auth.uid(), 'physician')
  );
CREATE POLICY "Faculty and admins can update mappings"
  ON public.content_blueprint_map FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'platform_admin')
    OR public.has_role(auth.uid(), 'faculty')
    OR public.has_role(auth.uid(), 'physician')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'platform_admin')
    OR public.has_role(auth.uid(), 'faculty')
    OR public.has_role(auth.uid(), 'physician')
  );
CREATE POLICY "Admins can delete mappings"
  ON public.content_blueprint_map FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER update_content_blueprint_map_updated_at
  BEFORE UPDATE ON public.content_blueprint_map
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Retrieval allow-list helper (used by the ATLAS web reader) --------------
CREATE OR REPLACE FUNCTION public.is_retrieval_domain_allowed(_hostname text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.content_sources
      WHERE allowed_for_retrieval AND status = 'approved'
    ) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.content_sources s
      WHERE s.allowed_for_retrieval
        AND s.status = 'approved'
        AND (lower(_hostname) = lower(s.domain) OR lower(_hostname) LIKE '%.' || lower(s.domain))
    )
  END
$$;

REVOKE ALL ON FUNCTION public.is_retrieval_domain_allowed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_retrieval_domain_allowed(text) TO authenticated, service_role;

-- 6) Blueprint coverage view -------------------------------------------------
CREATE OR REPLACE VIEW public.blueprint_coverage
WITH (security_invoker = true)
AS
SELECT
  n.id AS blueprint_node_id,
  n.exam,
  n.axis,
  n.code,
  n.title,
  n.weight_low,
  n.weight_high,
  count(m.id) AS mapped_items,
  count(m.id) FILTER (WHERE m.content_type = 'qbank_question') AS qbank_items,
  count(m.id) FILTER (WHERE m.content_type IN ('course_topic','learning_unit_content')) AS curriculum_items,
  count(m.id) FILTER (WHERE m.source_id IS NOT NULL) AS cited_items
FROM public.usmle_blueprint_nodes n
LEFT JOIN public.content_blueprint_map m ON m.blueprint_node_id = n.id
GROUP BY n.id, n.exam, n.axis, n.code, n.title, n.weight_low, n.weight_high;

GRANT SELECT ON public.blueprint_coverage TO authenticated, service_role;