import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QBankQuestion {
  id: string;
  question_id: string;
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  explanation_image_url?: string;
  question_image_url?: string;
  specialty_id?: string;
  subject: string;
  system: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: string;
  first_aid_reference?: string;
  board_yield: 'low' | 'medium' | 'high';
  keywords: string[];
}

export interface SessionQuestion extends QBankQuestion {
  selectedAnswer?: number;
  isCorrect?: boolean;
  timeSpent: number;
  isFlagged: boolean;
  strikethroughs: number[];
  highlights: { start: number; end: number }[];
  confidenceLevel?: 'guessing' | 'unsure' | 'confident';
}

export interface QBankSession {
  id: string;
  mode: 'tutor' | 'timed';
  questionCount: number;
  timeLimitMinutes?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  scorePercent?: number;
  currentQuestionIndex: number;
  timeRemainingSeconds?: number;
}

interface UseQBankSessionOptions {
  sessionId?: string;
}

export function useQBankSession(options: UseQBankSessionOptions = {}) {
  const { sessionId } = options;
  const { toast } = useToast();

  const [session, setSession] = useState<QBankSession | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex] || null;

  // Load existing session
  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('qbank_test_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError) throw sessionError;

      // Fetch questions for this session
      const questionIds = sessionData.question_order || [];
      if (questionIds.length === 0) {
        throw new Error('No questions in session');
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from('qbank_questions')
        .select('*')
        .in('id', questionIds);

      if (questionsError) throw questionsError;

      // Get user progress for these questions
      const { data: progressData } = await supabase
        .from('qbank_user_progress')
        .select('*')
        .eq('session_id', id);

      // Map questions with progress
      const orderedQuestions: SessionQuestion[] = questionIds.map((qId: string) => {
        const q = questionsData?.find(qq => qq.id === qId);
        const progress = progressData?.find(p => p.question_id === qId);
        
        const highlightsData = progress?.highlights as Array<{ start: number; end: number }> | null;
        const strikethroughsData = progress?.strikethroughs as number[] | null;
        
        return {
          id: q?.id || qId,
          question_id: q?.question_id || '',
          stem: q?.stem || '',
          options: (q?.options as string[]) || [],
          correct_answer_index: q?.correct_answer_index || 0,
          explanation: q?.explanation || '',
          explanation_image_url: q?.explanation_image_url || undefined,
          question_image_url: q?.question_image_url || undefined,
          specialty_id: q?.specialty_id || undefined,
          subject: q?.subject || '',
          system: q?.system || '',
          topic: q?.topic || undefined,
          difficulty: (q?.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
          question_type: q?.question_type || 'single_best',
          first_aid_reference: q?.first_aid_reference || undefined,
          board_yield: (q?.board_yield as 'low' | 'medium' | 'high') || 'medium',
          keywords: (q?.keywords as string[]) || [],
          selectedAnswer: progress?.selected_answer ?? undefined,
          isCorrect: progress?.is_correct ?? undefined,
          timeSpent: progress?.time_spent_seconds || 0,
          isFlagged: progress?.was_flagged || false,
          strikethroughs: strikethroughsData || [],
          highlights: highlightsData || [],
          confidenceLevel: progress?.confidence_level as 'guessing' | 'unsure' | 'confident' | undefined,
        };
      });

      setSession({
        id: sessionData.id,
        mode: sessionData.mode,
        questionCount: sessionData.question_count,
        timeLimitMinutes: sessionData.time_limit_minutes,
        status: sessionData.status,
        startedAt: new Date(sessionData.started_at),
        completedAt: sessionData.completed_at ? new Date(sessionData.completed_at) : undefined,
        scorePercent: sessionData.score_percent,
        currentQuestionIndex: sessionData.current_question_index || 0,
        timeRemainingSeconds: sessionData.time_remaining_seconds,
      });

      setQuestions(orderedQuestions);
      setCurrentIndex(sessionData.current_question_index || 0);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create new session
  const createSession = useCallback(async (config: {
    mode: 'tutor' | 'timed';
    questionCount: number;
    timeLimitMinutes?: number;
    filters: {
      subjects?: string[];
      systems?: string[];
      difficulties?: string[];
      specialtyIds?: string[];
      questionStatus?: 'unused' | 'incorrect' | 'flagged' | 'all';
    };
  }) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build query based on filters
      let query = supabase
        .from('qbank_questions')
        .select('id')
        .eq('is_active', true);

      if (config.filters.subjects?.length) {
        query = query.in('subject', config.filters.subjects);
      }
      if (config.filters.systems?.length) {
        query = query.in('system', config.filters.systems);
      }
      if (config.filters.difficulties?.length) {
        // Cast to proper enum type for Supabase query
        const difficulties = config.filters.difficulties as Array<'easy' | 'medium' | 'hard'>;
        query = query.in('difficulty', difficulties);
      }
      if (config.filters.specialtyIds?.length) {
        query = query.in('specialty_id', config.filters.specialtyIds);
      }

      const { data: availableQuestions, error: queryError } = await query;
      if (queryError) throw queryError;

      if (!availableQuestions || availableQuestions.length === 0) {
        toast({
          title: 'No questions available',
          description: 'Try adjusting your filters',
          variant: 'destructive',
        });
        return null;
      }

      // Shuffle and select questions
      const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
      const selectedIds = shuffled.slice(0, config.questionCount).map(q => q.id);

      // Create session
      const { data: newSession, error: sessionError } = await supabase
        .from('qbank_test_sessions')
        .insert({
          user_id: user.id,
          mode: config.mode,
          question_count: selectedIds.length,
          time_limit_minutes: config.timeLimitMinutes,
          filters_applied: config.filters,
          question_order: selectedIds,
          time_remaining_seconds: config.timeLimitMinutes ? config.timeLimitMinutes * 60 : null,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      return newSession.id;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Select an answer
  const selectAnswer = useCallback((answerIndex: number) => {
    if (!currentQuestion) return;

    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex
        ? { ...q, selectedAnswer: answerIndex }
        : q
    ));
  }, [currentIndex, currentQuestion]);

  // Submit current answer (tutor mode)
  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || currentQuestion.selectedAnswer === undefined || !session) return;

    setIsSubmitting(true);
    const isCorrect = currentQuestion.selectedAnswer === currentQuestion.correct_answer_index;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save progress
      await supabase
        .from('qbank_user_progress')
        .insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          session_id: session.id,
          selected_answer: currentQuestion.selectedAnswer,
          is_correct: isCorrect,
          time_spent_seconds: currentQuestion.timeSpent,
          was_flagged: currentQuestion.isFlagged,
          strikethroughs: currentQuestion.strikethroughs,
          highlights: currentQuestion.highlights,
          confidence_level: currentQuestion.confidenceLevel,
        });

      setQuestions(prev => prev.map((q, i) => 
        i === currentIndex
          ? { ...q, isCorrect }
          : q
      ));

      setShowExplanation(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to save answer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, currentIndex, session, toast]);

  // Toggle flag on current question
  const toggleFlag = useCallback(() => {
    if (!currentQuestion) return;

    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex
        ? { ...q, isFlagged: !q.isFlagged }
        : q
    ));
  }, [currentIndex, currentQuestion]);

  // Toggle strikethrough on an option
  const toggleStrikethrough = useCallback((optionIndex: number) => {
    if (!currentQuestion) return;

    setQuestions(prev => prev.map((q, i) => {
      if (i !== currentIndex) return q;
      
      const current = q.strikethroughs || [];
      const has = current.includes(optionIndex);
      
      return {
        ...q,
        strikethroughs: has
          ? current.filter(s => s !== optionIndex)
          : [...current, optionIndex]
      };
    }));
  }, [currentIndex, currentQuestion]);

  // Navigate to question
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      setShowExplanation(questions[index].isCorrect !== undefined);
    }
  }, [questions]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, questions.length, goToQuestion]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  // Complete session
  const completeSession = useCallback(async () => {
    if (!session) return;

    try {
      const correctCount = questions.filter(q => q.isCorrect).length;
      const answeredCount = questions.filter(q => q.selectedAnswer !== undefined).length;
      const scorePercent = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;

      await supabase
        .from('qbank_test_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score_percent: scorePercent,
        })
        .eq('id', session.id);

      setSession(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date(),
        scorePercent,
      } : null);

      return scorePercent;
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete session',
        variant: 'destructive',
      });
      return null;
    }
  }, [session, questions, toast]);

  // Update time spent
  const updateTimeSpent = useCallback((seconds: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex
        ? { ...q, timeSpent: q.timeSpent + seconds }
        : q
    ));
  }, [currentIndex]);

  // Load session on mount if sessionId provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  return {
    session,
    questions,
    currentQuestion,
    currentIndex,
    isLoading,
    isSubmitting,
    showExplanation,
    setShowExplanation,
    createSession,
    loadSession,
    selectAnswer,
    submitAnswer,
    toggleFlag,
    toggleStrikethrough,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    completeSession,
    updateTimeSpent,
  };
}
