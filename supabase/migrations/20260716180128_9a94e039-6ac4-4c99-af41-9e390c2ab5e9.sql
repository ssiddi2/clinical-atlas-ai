CREATE TABLE public.content_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('qbank_question','assessment_item','atlas_conversation','course_quiz')),
  content_id text NOT NULL,
  verdict text NOT NULL CHECK (verdict IN ('approved','needs_revision','rejected','flagged')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  reason text,
  sources_checked text[] NOT NULL DEFAULT '{}',
  notes text,
  reviewed_via text NOT NULL DEFAULT 'in_app' CHECK (reviewed_via IN ('in_app','mcp','automated')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_reviews_content ON public.content_reviews (content_type, content_id);
CREATE INDEX idx_content_reviews_reviewer ON public.content_reviews (reviewer_id);
CREATE INDEX idx_content_reviews_verdict ON public.content_reviews (verdict);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_reviews TO authenticated;
GRANT ALL ON public.content_reviews TO service_role;

ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reviews"
  ON public.content_reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role));

CREATE POLICY "Admins can insert reviews"
  ON public.content_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'platform_admin'::app_role)
    AND reviewer_id = auth.uid()
  );

CREATE POLICY "Admins can update their own reviews"
  ON public.content_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role) AND reviewer_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'::app_role) AND reviewer_id = auth.uid());

CREATE POLICY "Admins can delete their own reviews"
  ON public.content_reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'::app_role) AND reviewer_id = auth.uid());

CREATE TRIGGER update_content_reviews_updated_at
  BEFORE UPDATE ON public.content_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();