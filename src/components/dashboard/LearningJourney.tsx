import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Clock, CheckCircle2, BookOpen, Flame } from "lucide-react";

interface Props { userId: string | null }

interface Stats {
  studyMinutes: number;
  questionsAnswered: number;
  topicsCovered: number;
  streak: number;
}

export default function LearningJourney({ userId }: Props) {
  const [range, setRange] = useState("week");
  const [stats, setStats] = useState<Stats>({
    studyMinutes: 0, questionsAnswered: 0, topicsCovered: 0, streak: 0,
  });

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const now = new Date();
      const start = new Date();
      if (range === "week") start.setDate(now.getDate() - 7);
      else if (range === "month") start.setMonth(now.getMonth() - 1);
      else start.setFullYear(now.getFullYear() - 5);

      const [attemptsRes, progressRes] = await Promise.all([
        supabase
          .from("assessment_attempts")
          .select("total_questions, time_taken_seconds, created_at")
          .eq("user_id", userId)
          .gte("created_at", start.toISOString()),
        supabase
          .from("learning_unit_progress")
          .select("topic_id, completed")
          .eq("student_id", userId)
          .eq("completed", true),
      ]);

      const attempts = (attemptsRes.data as any[]) || [];
      const seconds = attempts.reduce((s, a) => s + (a.time_taken_seconds || 0), 0);
      const questions = attempts.reduce((s, a) => s + (a.total_questions || 0), 0);
      const topics = new Set(((progressRes.data as any[]) || []).map((p) => p.topic_id));

      const days = new Set(
        attempts.map((a) => new Date(a.created_at).toISOString().slice(0, 10)),
      );
      let streak = 0;
      const cursor = new Date();
      while (days.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      setStats({
        studyMinutes: Math.round(seconds / 60),
        questionsAnswered: questions,
        topicsCovered: topics.size,
        streak,
      });
    };
    load().catch(() => {});
  }, [userId, range]);

  const items = [
    { icon: Clock, label: "Study Time", value: `${stats.studyMinutes}m`, color: "bg-blue-500 text-white" },
    { icon: CheckCircle2, label: "Questions Answered", value: `${stats.questionsAnswered}`, color: "bg-sky-500 text-white" },
    { icon: BookOpen, label: "Topics Covered", value: `${stats.topicsCovered}`, color: "bg-emerald-500 text-white" },
    { icon: Flame, label: "Streak", value: `${stats.streak}`, color: "bg-violet-500 text-white" },
  ];

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm bg-gradient-to-br from-slate-50/70 to-background">
      <CardContent className="p-6 md:p-7">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Your Learning Journey</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Track your progress and achievements</p>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32 h-9" aria-label="Time range"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.label} className="rounded-xl bg-background border border-border/70 p-4 flex items-center gap-3 hover:border-border hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${it.color}`}>
                <it.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold leading-none tracking-tight text-foreground">{it.value}</div>
                <div className="text-xs text-muted-foreground mt-1.5">{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}