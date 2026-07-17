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
          .from("question_attempts")
          .select("id, topic_id, created_at, time_spent_seconds")
          .eq("user_id", userId)
          .gte("created_at", start.toISOString()),
        supabase
          .from("learning_unit_progress")
          .select("topic_id, completed")
          .eq("student_id", userId)
          .eq("completed", true),
      ]);

      const attempts = (attemptsRes.data as any[]) || [];
      const seconds = attempts.reduce((s, a) => s + (a.time_spent_seconds || 0), 0);
      const topics = new Set(((progressRes.data as any[]) || []).map((p) => p.topic_id));

      // Streak: consecutive days with attempts
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
        questionsAnswered: attempts.length,
        topicsCovered: topics.size,
        streak,
      });
    };
    load().catch(() => {});
  }, [userId, range]);

  const items = [
    { icon: Clock, label: "Study Time", value: `${stats.studyMinutes}m`, color: "bg-blue-100 text-blue-600" },
    { icon: CheckCircle2, label: "Questions Answered", value: `${stats.questionsAnswered}`, color: "bg-sky-100 text-sky-600" },
    { icon: BookOpen, label: "Topics Covered", value: `${stats.topicsCovered}`, color: "bg-emerald-100 text-emerald-600" },
    { icon: Flame, label: "Streak", value: `${stats.streak}`, color: "bg-violet-100 text-violet-600" },
  ];

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold">Your Learning Journey</h3>
            <p className="text-sm text-muted-foreground">Track your progress and achievements</p>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.label} className="rounded-xl bg-white border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${it.color}`}>
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none">{it.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}