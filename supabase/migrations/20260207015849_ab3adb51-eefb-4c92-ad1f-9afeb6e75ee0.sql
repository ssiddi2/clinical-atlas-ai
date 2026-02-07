-- ============================================
-- QBank System: Database Schema Migration
-- ============================================

-- Create ENUM types for QBank
CREATE TYPE qbank_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE qbank_mode AS ENUM ('tutor', 'timed');
CREATE TYPE qbank_session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE qbank_confidence_level AS ENUM ('guessing', 'unsure', 'confident');
CREATE TYPE qbank_flag_type AS ENUM ('review_later', 'difficult', 'bookmark');
CREATE TYPE qbank_board_yield AS ENUM ('low', 'medium', 'high');

-- ============================================
-- 1. qbank_questions - Question Bank
-- ============================================
CREATE TABLE public.qbank_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT UNIQUE NOT NULL, -- e.g., "QCARD-0042"
    stem TEXT NOT NULL, -- Clinical vignette
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of answer choices
    correct_answer_index INTEGER NOT NULL,
    explanation TEXT NOT NULL, -- Detailed explanation
    explanation_image_url TEXT,
    question_image_url TEXT,
    specialty_id UUID REFERENCES public.specialties(id),
    subject TEXT NOT NULL, -- e.g., "Pathophysiology", "Pharmacology"
    system TEXT NOT NULL, -- e.g., "Cardiovascular", "Respiratory"
    topic TEXT, -- Specific topic within system
    difficulty qbank_difficulty NOT NULL DEFAULT 'medium',
    question_type TEXT NOT NULL DEFAULT 'single_best', -- single_best, extended_matching
    first_aid_reference TEXT,
    board_yield qbank_board_yield NOT NULL DEFAULT 'medium',
    keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on qbank_questions
ALTER TABLE public.qbank_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active questions
CREATE POLICY "Anyone can view active questions"
ON public.qbank_questions
FOR SELECT
USING (is_active = true);

-- ============================================
-- 2. qbank_test_sessions - Test Sessions
-- ============================================
CREATE TABLE public.qbank_test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mode qbank_mode NOT NULL DEFAULT 'tutor',
    question_count INTEGER NOT NULL DEFAULT 0,
    time_limit_minutes INTEGER,
    filters_applied JSONB DEFAULT '{}'::jsonb,
    status qbank_session_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score_percent DECIMAL(5,2),
    question_order UUID[] DEFAULT '{}', -- Stores the order of questions for this session
    current_question_index INTEGER DEFAULT 0,
    time_remaining_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on qbank_test_sessions
ALTER TABLE public.qbank_test_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.qbank_test_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create their own sessions"
ON public.qbank_test_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.qbank_test_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- 3. qbank_user_progress - Question Attempts
-- ============================================
CREATE TABLE public.qbank_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.qbank_questions(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.qbank_test_sessions(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    selected_answer INTEGER,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER DEFAULT 0,
    was_flagged BOOLEAN DEFAULT false,
    confidence_level qbank_confidence_level,
    highlights JSONB DEFAULT '[]'::jsonb, -- Stores highlight positions
    strikethroughs INTEGER[] DEFAULT '{}', -- Stores crossed-out option indices
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on qbank_user_progress
ALTER TABLE public.qbank_user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON public.qbank_user_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own progress
CREATE POLICY "Users can create their own progress"
ON public.qbank_user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON public.qbank_user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- 4. qbank_flagged_questions - Bookmarks
-- ============================================
CREATE TABLE public.qbank_flagged_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.qbank_questions(id) ON DELETE CASCADE,
    flag_type qbank_flag_type NOT NULL DEFAULT 'bookmark',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, question_id)
);

-- Enable RLS on qbank_flagged_questions
ALTER TABLE public.qbank_flagged_questions ENABLE ROW LEVEL SECURITY;

-- Users can view their own flags
CREATE POLICY "Users can view their own flags"
ON public.qbank_flagged_questions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own flags
CREATE POLICY "Users can create their own flags"
ON public.qbank_flagged_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own flags
CREATE POLICY "Users can update their own flags"
ON public.qbank_flagged_questions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own flags
CREATE POLICY "Users can delete their own flags"
ON public.qbank_flagged_questions
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 5. Triggers for updated_at
-- ============================================
CREATE TRIGGER update_qbank_questions_updated_at
BEFORE UPDATE ON public.qbank_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. Indexes for performance
-- ============================================
CREATE INDEX idx_qbank_questions_specialty ON public.qbank_questions(specialty_id);
CREATE INDEX idx_qbank_questions_subject ON public.qbank_questions(subject);
CREATE INDEX idx_qbank_questions_system ON public.qbank_questions(system);
CREATE INDEX idx_qbank_questions_difficulty ON public.qbank_questions(difficulty);
CREATE INDEX idx_qbank_questions_active ON public.qbank_questions(is_active);

CREATE INDEX idx_qbank_user_progress_user ON public.qbank_user_progress(user_id);
CREATE INDEX idx_qbank_user_progress_question ON public.qbank_user_progress(question_id);
CREATE INDEX idx_qbank_user_progress_session ON public.qbank_user_progress(session_id);

CREATE INDEX idx_qbank_test_sessions_user ON public.qbank_test_sessions(user_id);
CREATE INDEX idx_qbank_test_sessions_status ON public.qbank_test_sessions(status);

CREATE INDEX idx_qbank_flagged_user ON public.qbank_flagged_questions(user_id);
CREATE INDEX idx_qbank_flagged_question ON public.qbank_flagged_questions(question_id);