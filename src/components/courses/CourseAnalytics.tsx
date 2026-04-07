import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardCheck, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { TopicHeatmap } from "@/components/score/TopicHeatmap";

interface Props {
  courseId: string;
}

interface StudentPerformance {
  student_id: string;
  first_name: string;
  last_name: string;
  total_attempts: number;
  avg_score: number;
  best_score: number;
  total_time: number;
}

export default function CourseAnalytics({ courseId }: Props) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => { loadAnalytics(); }, [courseId]);

  const loadAnalytics = async () => {
    // Get quizzes for this course
    const { data: quizzes } = await supabase
      .from("course_quizzes")
      .select("id")
      .eq("course_id", courseId)
      .eq("status", "published");

    const quizIds = quizzes?.map(q => q.id) || [];
    setQuizCount(quizIds.length);

    if (quizIds.length === 0) { setLoading(false); return; }

    // Get all attempts for these quizzes
    const { data: attempts } = await supabase
      .from("course_quiz_attempts")
      .select("*")
      .in("quiz_id", quizIds);

    if (!attempts || attempts.length === 0) { setLoading(false); return; }

    setTotalAttempts(attempts.length);

    // Compute avg score
    const overallAvg = attempts.reduce((sum, a) => sum + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / attempts.length;
    setAvgScore(Math.round(overallAvg));

    // Group by student
    const studentMap = new Map<string, { scores: number[]; totalTime: number; totalQ: number; totalCorrect: number }>();
    attempts.forEach(a => {
      const existing = studentMap.get(a.student_id) || { scores: [], totalTime: 0, totalQ: 0, totalCorrect: 0 };
      const pct = a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0;
      existing.scores.push(pct);
      existing.totalTime += a.time_taken_seconds;
      existing.totalQ += a.total_questions;
      existing.totalCorrect += a.score;
      studentMap.set(a.student_id, existing);
    });

    // Fetch student profiles
    const studentIds = Array.from(studentMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", studentIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const studentPerfs: StudentPerformance[] = studentIds.map(sid => {
      const data = studentMap.get(sid)!;
      const profile = profileMap.get(sid);
      return {
        student_id: sid,
        first_name: profile?.first_name || "Unknown",
        last_name: profile?.last_name || "",
        total_attempts: data.scores.length,
        avg_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        best_score: Math.max(...data.scores),
        total_time: data.totalTime,
      };
    }).sort((a, b) => b.avg_score - a.avg_score);

    setStudents(studentPerfs);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: ClipboardCheck, label: "Published Quizzes", value: quizCount },
          { icon: Users, label: "Students w/ Attempts", value: students.length },
          { icon: BarChart3, label: "Total Attempts", value: totalAttempts },
          { icon: TrendingUp, label: "Avg Score", value: `${avgScore}%` },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/30">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Performance Table */}
      {students.length > 0 ? (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground font-medium px-3 py-1">
                <span>Student</span>
                <span className="text-center">Attempts</span>
                <span className="text-center">Avg Score</span>
                <span className="text-center">Best Score</span>
                <span className="text-center">Time Spent</span>
              </div>
              {students.map(s => (
                <div key={s.student_id} className="grid grid-cols-5 gap-2 items-center px-3 py-2.5 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium truncate">{s.first_name} {s.last_name}</span>
                  <span className="text-sm text-center text-muted-foreground">{s.total_attempts}</span>
                  <span className={`text-sm text-center font-semibold ${getScoreColor(s.avg_score)}`}>{s.avg_score}%</span>
                  <span className={`text-sm text-center font-semibold ${getScoreColor(s.best_score)}`}>{s.best_score}%</span>
                  <span className="text-sm text-center text-muted-foreground">
                    {Math.round(s.total_time / 60)}m
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No quiz attempts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Analytics will appear once students complete quizzes</p>
        </div>
      )}
    </div>
  );
}
