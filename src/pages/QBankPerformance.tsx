import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Clock, 
  BarChart3,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface PerformanceData {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  totalTime: number;
  sessionsCount: number;
  bySubject: Record<string, { total: number; correct: number }>;
  bySystem: Record<string, { total: number; correct: number }>;
  byDifficulty: Record<string, { total: number; correct: number }>;
  scoreHistory: { date: string; score: number }[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function QBankPerformance() {
  const navigate = useNavigate();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch all user progress
      const { data: progress } = await supabase
        .from('qbank_user_progress')
        .select(`
          *,
          qbank_questions (
            subject,
            system,
            difficulty
          )
        `)
        .eq('user_id', user.id);

      // Fetch completed sessions
      const { data: sessions } = await supabase
        .from('qbank_test_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

      if (!progress) {
        setIsLoading(false);
        return;
      }

      const bySubject: Record<string, { total: number; correct: number }> = {};
      const bySystem: Record<string, { total: number; correct: number }> = {};
      const byDifficulty: Record<string, { total: number; correct: number }> = {};
      let totalTime = 0;

      progress.forEach((p: any) => {
        const q = p.qbank_questions;
        if (!q) return;

        totalTime += p.time_spent_seconds || 0;

        // By Subject
        if (!bySubject[q.subject]) bySubject[q.subject] = { total: 0, correct: 0 };
        bySubject[q.subject].total++;
        if (p.is_correct) bySubject[q.subject].correct++;

        // By System
        if (!bySystem[q.system]) bySystem[q.system] = { total: 0, correct: 0 };
        bySystem[q.system].total++;
        if (p.is_correct) bySystem[q.system].correct++;

        // By Difficulty
        if (!byDifficulty[q.difficulty]) byDifficulty[q.difficulty] = { total: 0, correct: 0 };
        byDifficulty[q.difficulty].total++;
        if (p.is_correct) byDifficulty[q.difficulty].correct++;
      });

      const correctCount = progress.filter((p: any) => p.is_correct).length;

      // Build score history from sessions
      const scoreHistory = sessions?.map((s: any) => ({
        date: new Date(s.completed_at || s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.score_percent || 0,
      })) || [];

      setData({
        totalQuestions: progress.length,
        correctAnswers: correctCount,
        averageScore: progress.length > 0 ? (correctCount / progress.length) * 100 : 0,
        totalTime,
        sessionsCount: sessions?.length || 0,
        bySubject,
        bySystem,
        byDifficulty,
        scoreHistory,
      });

      setIsLoading(false);
    };

    fetchPerformanceData();
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data || data.totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/qbank')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">Performance Analytics</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Data Yet</h2>
          <p className="text-muted-foreground mb-6">Complete some practice questions to see your performance analytics.</p>
          <Button asChild>
            <Link to="/qbank/create">Start Practicing</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subjectData = Object.entries(data.bySubject)
    .map(([name, stats]) => ({
      name,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total,
    }))
    .sort((a, b) => b.total - a.total);

  const systemData = Object.entries(data.bySystem)
    .map(([name, stats]) => ({
      name,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total,
    }))
    .sort((a, b) => b.total - a.total);

  const difficultyData = Object.entries(data.byDifficulty).map(([name, stats]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: stats.total,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));

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
              <h1 className="text-xl font-semibold text-foreground">Performance Analytics</h1>
            </div>
            <Button asChild>
              <Link to="/qbank/create">Practice More</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{data.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold text-foreground">{data.correctAnswers}/{data.totalQuestions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold text-foreground">{formatTime(data.totalTime)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
                <p className="text-2xl font-bold text-foreground">{data.sessionsCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Score Trend */}
        {data.scoreHistory.length > 1 && (
          <Card className="p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4">Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <Tabs defaultValue="subject" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subject">By Subject</TabsTrigger>
            <TabsTrigger value="system">By System</TabsTrigger>
            <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
          </TabsList>

          <TabsContent value="subject">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-6">Performance by Subject</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Accuracy']}
                    />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-6">Performance by Organ System</h3>
              <div className="space-y-4">
                {systemData.map((sys) => (
                  <div key={sys.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">{sys.name}</span>
                      <span className="text-sm text-muted-foreground">{sys.accuracy}% ({sys.total} Qs)</span>
                    </div>
                    <Progress value={sys.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="difficulty">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-6">Performance by Difficulty</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {difficultyData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {difficultyData.map((diff, index) => (
                    <div key={diff.name} className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-foreground">{diff.name}</span>
                          <span className="text-sm text-muted-foreground">{diff.accuracy}% accuracy</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{diff.value} questions attempted</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
