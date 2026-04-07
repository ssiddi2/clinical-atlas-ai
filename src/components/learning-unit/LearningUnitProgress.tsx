import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";

interface Props {
  topicId: string;
  courseId: string;
}

export default function LearningUnitProgress({ topicId, courseId }: Props) {
  const [progress, setProgress] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: progressData } = await supabase
        .from("learning_unit_progress")
        .select("*")
        .eq("topic_id", topicId);

      if (progressData && progressData.length > 0) {
        setProgress(progressData);
        const studentIds = progressData.map(p => p.student_id);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", studentIds);
        if (profileData) {
          const map: Record<string, any> = {};
          profileData.forEach(p => { map[p.user_id] = p; });
          setProfiles(map);
        }
      }
      setLoading(false);
    };
    load();
  }, [topicId]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const completed = progress.filter(p => p.completed).length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + (p.quiz_score || 0), 0) / progress.length)
    : 0;
  const struggling = progress.filter(p => p.quiz_score !== null && p.quiz_score < 70);
  const avgTime = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + (p.time_spent_seconds || 0), 0) / progress.length / 60)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50"><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{progress.length}</p>
          <p className="text-xs text-muted-foreground">Students Attempted</p>
        </CardContent></Card>
        <Card className="bg-card/50"><CardContent className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-400" />
          <p className="text-2xl font-bold">{completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card className="bg-card/50"><CardContent className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-400" />
          <p className="text-2xl font-bold">{avgScore}%</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </CardContent></Card>
        <Card className="bg-card/50"><CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
          <p className="text-2xl font-bold">{avgTime}m</p>
          <p className="text-xs text-muted-foreground">Avg Time</p>
        </CardContent></Card>
      </div>

      {struggling.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" /> Struggling Students
          </CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {struggling.map(s => {
                const p = profiles[s.student_id];
                return (
                  <Badge key={s.id} variant="outline" className="text-red-400 border-red-500/30">
                    {p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Student" : "Student"} — {s.quiz_score}%
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {progress.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No student progress data yet.</p>
      ) : (
        <Card className="bg-card/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progress.map(p => {
                  const profile = profiles[p.student_id];
                  const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Unknown";
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{p.quiz_score !== null ? `${p.quiz_score}%` : "—"}</TableCell>
                      <TableCell>{p.attempts}</TableCell>
                      <TableCell>{Math.round((p.time_spent_seconds || 0) / 60)}m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={p.completed ? "text-green-400 border-green-500/30" : "text-yellow-400 border-yellow-500/30"}>
                          {p.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
