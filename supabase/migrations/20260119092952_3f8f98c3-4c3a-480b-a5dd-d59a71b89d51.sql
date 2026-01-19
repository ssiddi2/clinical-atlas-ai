-- Create assessment_attempts table to track every quiz/assessment taken
CREATE TABLE public.assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'practice',
  specialty_id UUID REFERENCES public.specialties(id),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  difficulty_distribution JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}'::jsonb,
  topic_performance JSONB DEFAULT '{}'::jsonb,
  predicted_score INTEGER,
  percentile INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessment attempts"
ON public.assessment_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment attempts"
ON public.assessment_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create usmle_score_predictions table for rolling score predictions
CREATE TABLE public.usmle_score_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  predicted_step1_score INTEGER,
  predicted_step2_score INTEGER,
  pass_probability_step1 DECIMAL(5,2),
  pass_probability_step2 DECIMAL(5,2),
  match_probability DECIMAL(5,2),
  confidence_interval JSONB DEFAULT '{"low": 0, "high": 0}'::jsonb,
  contributing_factors JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, prediction_date)
);

-- Enable RLS
ALTER TABLE public.usmle_score_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own score predictions"
ON public.usmle_score_predictions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own score predictions"
ON public.usmle_score_predictions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own score predictions"
ON public.usmle_score_predictions FOR UPDATE
USING (auth.uid() = user_id);

-- Create competency_scores table for ACGME Core Competency tracking
CREATE TABLE public.competency_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  competency_type TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL DEFAULT 0,
  assessment_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, competency_type)
);

-- Enable RLS
ALTER TABLE public.competency_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own competency scores"
ON public.competency_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competency scores"
ON public.competency_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competency scores"
ON public.competency_scores FOR UPDATE
USING (auth.uid() = user_id);