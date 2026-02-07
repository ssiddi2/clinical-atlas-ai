import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  BarChart3, 
  Plus, 
  Flag,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface SessionStats {
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  recentSessions: {
    id: string;
    mode: string;
    question_count: number;
    score_percent: number;
    completed_at: string;
  }[];
}

export default function QBank() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averageScore: 0,
    recentSessions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch total available questions
      const { count: qCount } = await supabase
        .from('qbank_questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setQuestionCount(qCount || 0);

      // Fetch user's completed sessions
      const { data: sessions } = await supabase
        .from('qbank_test_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      // Fetch user's progress stats
      const { data: progress } = await supabase
        .from('qbank_user_progress')
        .select('is_correct')
        .eq('user_id', user.id);

      const totalAnswered = progress?.length || 0;
      const correctCount = progress?.filter(p => p.is_correct).length || 0;

      setStats({
        totalSessions: sessions?.length || 0,
        totalQuestions: totalAnswered,
        correctAnswers: correctCount,
        averageScore: totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0,
        recentSessions: sessions?.map(s => ({
          id: s.id,
          mode: s.mode,
          question_count: s.question_count,
          score_percent: s.score_percent || 0,
          completed_at: s.completed_at || s.created_at,
        })) || [],
      });

      setIsLoading(false);
    };

    fetchStats();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Question Bank</h1>
              <p className="text-muted-foreground">
                Practice with {questionCount.toLocaleString()}+ USMLE-style questions
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to="/qbank/create">
                <Plus className="h-5 w-5" />
                Start New Test
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalQuestions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold text-foreground">{stats.correctAnswers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{stats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Quick Start</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/qbank/create')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Tutor Mode</h3>
                    <p className="text-sm text-muted-foreground">Learn with instant feedback</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/qbank/create')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Timed Exam</h3>
                    <p className="text-sm text-muted-foreground">Simulate real test conditions</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  Take Exam <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/qbank/performance')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Performance</h3>
                    <p className="text-sm text-muted-foreground">View detailed analytics</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  View Stats <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/qbank/create?status=incorrect')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Review Mistakes</h3>
                    <p className="text-sm text-muted-foreground">Practice questions you got wrong</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  Review <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Sessions</h2>
            
            {isLoading ? (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">Loading...</p>
              </Card>
            ) : stats.recentSessions.length === 0 ? (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">No completed sessions yet</p>
                <Button asChild className="w-full mt-4">
                  <Link to="/qbank/create">Start Your First Test</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {stats.recentSessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {session.mode} Mode
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.completed_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {session.question_count} questions
                      </span>
                      <span className={`text-sm font-semibold ${
                        session.score_percent >= 70 ? 'text-green-400' : 
                        session.score_percent >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {session.score_percent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={session.score_percent} 
                      className="h-2"
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
