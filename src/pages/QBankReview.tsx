import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  BookOpen,
  Flag,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ReviewQuestion {
  id: string;
  question_id: string;
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  subject: string;
  system: string;
  difficulty: string;
  selectedAnswer?: number;
  isCorrect?: boolean;
  timeSpent: number;
}

interface SessionSummary {
  id: string;
  mode: string;
  questionCount: number;
  scorePercent: number;
  completedAt: string;
  totalTime: number;
}

export default function QBankReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionSummary | null>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      if (!id) return;

      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from('qbank_test_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError || !sessionData) {
        navigate('/qbank');
        return;
      }

      // Fetch questions
      const questionIds = sessionData.question_order || [];
      const { data: questionsData } = await supabase
        .from('qbank_questions')
        .select('*')
        .in('id', questionIds);

      // Fetch progress
      const { data: progressData } = await supabase
        .from('qbank_user_progress')
        .select('*')
        .eq('session_id', id);

      const totalTime = progressData?.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0) || 0;

      setSession({
        id: sessionData.id,
        mode: sessionData.mode,
        questionCount: sessionData.question_count,
        scorePercent: sessionData.score_percent || 0,
        completedAt: sessionData.completed_at || sessionData.created_at,
        totalTime,
      });

      const mappedQuestions: ReviewQuestion[] = questionIds.map((qId: string) => {
        const q = questionsData?.find(qq => qq.id === qId);
        const progress = progressData?.find(p => p.question_id === qId);

        return {
          id: q?.id || qId,
          question_id: q?.question_id || '',
          stem: q?.stem || '',
          options: q?.options as string[] || [],
          correct_answer_index: q?.correct_answer_index || 0,
          explanation: q?.explanation || '',
          subject: q?.subject || '',
          system: q?.system || '',
          difficulty: q?.difficulty || 'medium',
          selectedAnswer: progress?.selected_answer,
          isCorrect: progress?.is_correct,
          timeSpent: progress?.time_spent_seconds || 0,
        };
      });

      setQuestions(mappedQuestions);
      setIsLoading(false);
    };

    loadReview();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const correctCount = questions.filter(q => q.isCorrect).length;
  const incorrectCount = questions.filter(q => q.isCorrect === false).length;
  const unansweredCount = questions.filter(q => q.selectedAnswer === undefined).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDifficultyStats = () => {
    const stats = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
    questions.forEach(q => {
      const diff = q.difficulty as keyof typeof stats;
      if (stats[diff]) {
        stats[diff].total++;
        if (q.isCorrect) stats[diff].correct++;
      }
    });
    return stats;
  };

  const getSubjectStats = () => {
    const stats: Record<string, { total: number; correct: number }> = {};
    questions.forEach(q => {
      if (!stats[q.subject]) stats[q.subject] = { total: 0, correct: 0 };
      stats[q.subject].total++;
      if (q.isCorrect) stats[q.subject].correct++;
    });
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  };

  const difficultyStats = getDifficultyStats();
  const subjectStats = getSubjectStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/qbank')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Session Review</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {session.mode} Mode • {session.questionCount} questions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/qbank/performance">View Performance</Link>
              </Button>
              <Button asChild>
                <Link to="/qbank/create">New Test</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Score Summary */}
        <Card className="p-8 mb-8 text-center bg-gradient-to-b from-card to-background">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary mb-6">
            <span className="text-4xl font-bold text-primary">{session.scorePercent.toFixed(0)}%</span>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-green-400">{correctCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-2xl font-bold text-red-400">{incorrectCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flag className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{unansweredCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold text-blue-400">{formatTime(session.totalTime)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Question List */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-4">All Questions</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                        selectedQuestion?.id === q.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent',
                        q.isCorrect === true && 'border-l-4 border-l-green-500',
                        q.isCorrect === false && 'border-l-4 border-l-red-500',
                        q.selectedAnswer === undefined && 'border-l-4 border-l-yellow-500'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        q.isCorrect === true && 'bg-green-500/20 text-green-400',
                        q.isCorrect === false && 'bg-red-500/20 text-red-400',
                        q.selectedAnswer === undefined && 'bg-yellow-500/20 text-yellow-400'
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{q.stem.substring(0, 60)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                          <Badge variant="outline" className="text-xs">{q.system}</Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Question Detail */}
              <Card className="p-6">
                {selectedQuestion ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ID: {selectedQuestion.question_id}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{selectedQuestion.difficulty}</Badge>
                        {selectedQuestion.isCorrect === true && (
                          <Badge className="bg-green-500/20 text-green-400">Correct</Badge>
                        )}
                        {selectedQuestion.isCorrect === false && (
                          <Badge className="bg-red-500/20 text-red-400">Incorrect</Badge>
                        )}
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-foreground">{selectedQuestion.stem}</p>
                    </div>

                    <div className="space-y-2">
                      {selectedQuestion.options.map((option, i) => (
                        <div
                          key={i}
                          className={cn(
                            'p-3 rounded-lg border-2',
                            i === selectedQuestion.correct_answer_index && 'border-green-500 bg-green-500/10',
                            i === selectedQuestion.selectedAnswer && i !== selectedQuestion.correct_answer_index && 'border-red-500 bg-red-500/10',
                            i !== selectedQuestion.correct_answer_index && i !== selectedQuestion.selectedAnswer && 'border-border'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                              i === selectedQuestion.correct_answer_index && 'bg-green-500 text-white',
                              i === selectedQuestion.selectedAnswer && i !== selectedQuestion.correct_answer_index && 'bg-red-500 text-white',
                              i !== selectedQuestion.correct_answer_index && i !== selectedQuestion.selectedAnswer && 'bg-muted text-muted-foreground'
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-foreground">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-2">Explanation</h4>
                      <p className="text-muted-foreground">{selectedQuestion.explanation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a question to view details</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Difficulty Breakdown */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Performance by Difficulty</h3>
                <div className="space-y-4">
                  {Object.entries(difficultyStats).map(([diff, stats]) => (
                    <div key={diff}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-foreground capitalize">{diff}</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.correct}/{stats.total} ({stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)
                        </span>
                      </div>
                      <Progress 
                        value={stats.total > 0 ? (stats.correct / stats.total) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Subject Breakdown */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Performance by Subject</h3>
                <div className="space-y-4">
                  {subjectStats.map(([subject, stats]) => (
                    <div key={subject}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-foreground">{subject}</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.correct}/{stats.total} ({stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)
                        </span>
                      </div>
                      <Progress 
                        value={stats.total > 0 ? (stats.correct / stats.total) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
