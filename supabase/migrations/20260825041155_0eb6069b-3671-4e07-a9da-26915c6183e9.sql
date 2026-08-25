-- ===========================================================================
-- Curriculum lane scaffolding: source pairing + faculty authoring queue
-- ===========================================================================

CREATE TABLE public.blueprint_node_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_node_id uuid NOT NULL REFERENCES public.usmle_blueprint_nodes(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX blueprint_node_sources_unique
  ON public.blueprint_node_sources (blueprint_node_id, source_id, role);
CREATE INDEX blueprint_node_sources_node_idx
  ON public.blueprint_node_sources (blueprint_node_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blueprint_node_sources TO authenticated;
GRANT ALL ON public.blueprint_node_sources TO service_role;

ALTER TABLE public.blueprint_node_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty and admins can read lane sources"
  ON public.blueprint_node_sources FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
    OR public.has_role(auth.uid(), 'physician'::app_role)
  );

CREATE POLICY "Faculty and admins can manage lane sources"
  ON public.blueprint_node_sources FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
  );

CREATE TRIGGER update_blueprint_node_sources_updated_at
  BEFORE UPDATE ON public.blueprint_node_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------

CREATE TABLE public.curriculum_authoring_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_node_id uuid NOT NULL REFERENCES public.usmle_blueprint_nodes(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.course_topics(id) ON DELETE SET NULL,
  owner_id uuid,
  status text NOT NULL DEFAULT 'not_started',
  target_items integer NOT NULL DEFAULT 20,
  priority integer NOT NULL DEFAULT 0,
  due_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX curriculum_authoring_tasks_node_unique
  ON public.curriculum_authoring_tasks (blueprint_node_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculum_authoring_tasks TO authenticated;
GRANT ALL ON public.curriculum_authoring_tasks TO service_role;

ALTER TABLE public.curriculum_authoring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty and admins can read authoring queue"
  ON public.curriculum_authoring_tasks FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
    OR public.has_role(auth.uid(), 'physician'::app_role)
  );

CREATE POLICY "Faculty and admins can manage authoring queue"
  ON public.curriculum_authoring_tasks FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    OR public.has_role(auth.uid(), 'faculty'::app_role)
  );

CREATE TRIGGER update_curriculum_authoring_tasks_updated_at
  BEFORE UPDATE ON public.curriculum_authoring_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Lane readiness report
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.lane_readiness
WITH (security_invoker = true) AS
SELECT
  n.id                AS blueprint_node_id,
  n.exam,
  n.axis,
  n.code,
  n.title,
  n.weight_low,
  n.weight_high,
  n.sort_order,
  COALESCE(m.mapped_items, 0)     AS mapped_items,
  COALESCE(m.qbank_items, 0)      AS qbank_items,
  COALESCE(m.curriculum_items, 0) AS curriculum_items,
  COALESCE(s.source_count, 0)     AS source_count,
  t.id                            AS task_id,
  t.topic_id,
  COALESCE(t.status, 'not_started') AS status,
  t.owner_id,
  COALESCE(t.target_items, 20)    AS target_items,
  t.due_on,
  t.notes
FROM public.usmle_blueprint_nodes n
LEFT JOIN (
  SELECT
    blueprint_node_id,
    COUNT(*) AS mapped_items,
    COUNT(*) FILTER (WHERE content_type = 'qbank_question') AS qbank_items,
    COUNT(*) FILTER (WHERE content_type IN ('learning_unit', 'course_topic', 'lesson')) AS curriculum_items
  FROM public.content_blueprint_map
  WHERE blueprint_node_id IS NOT NULL
  GROUP BY blueprint_node_id
) m ON m.blueprint_node_id = n.id
LEFT JOIN (
  SELECT bns.blueprint_node_id, COUNT(*) AS source_count
  FROM public.blueprint_node_sources bns
  JOIN public.content_sources cs ON cs.id = bns.source_id AND cs.status = 'approved'
  GROUP BY bns.blueprint_node_id
) s ON s.blueprint_node_id = n.id
LEFT JOIN public.curriculum_authoring_tasks t ON t.blueprint_node_id = n.id;

GRANT SELECT ON public.lane_readiness TO authenticated;