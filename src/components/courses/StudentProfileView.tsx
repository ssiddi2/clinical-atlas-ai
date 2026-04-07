import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, BookOpen, ClipboardCheck, Calendar, TrendingUp } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
  courseId: string;
}

export default function StudentProfileView({ open, onClose, studentId, courseId }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && studentId) loadStudentData();
  }, [open, studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    const [profileRes, attemptsRes, enrollmentsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", studentId).single(),
      supabase.from("course_quiz_attempts")
        .select("*, course_quizzes(title, course_id)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("course_enrollments")
        .select("*, courses(title, status)")
        .eq("student_id", studentId)
        .eq("status", "approved"),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (attemptsRes.data) setQuizAttempts(attemptsRes.data);
    if (enrollmentsRes.data) setEnrolledCourses(enrollmentsRes.data);
    setLoading(false);
  };

  if (!open) return null;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-400";
    if (pct >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {loading ? "Loading..." : `${profile?.first_name || ""} ${profile?.last_name || ""}`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Quiz Performance</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[55vh] mt-3">
              <TabsContent value="overview" className="space-y-4">
                <Card className="bg-card/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Institution:</span> <span className="ml-1 font-medium">{profile?.institution || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Year:</span> <span className="ml-1 font-medium">{profile?.year_of_study || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Program:</span> <span className="ml-1 font-medium capitalize">{profile?.program_level?.replace("_", " ") || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Target Specialty:</span> <span className="ml-1 font-medium">{profile?.target_specialty || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Step 1:</span> <span className="ml-1 font-medium">{profile?.usmle_step1_status || "N/A"} {profile?.usmle_step1_score ? `(${profile.usmle_step1_score})` : ""}</span></div>
                      <div><span className="text-muted-foreground">Step 2:</span> <span className="ml-1 font-medium">{profile?.usmle_step2_status || "N/A"} {profile?.usmle_step2_score ? `(${profile.usmle_step2_score})` : ""}</span></div>
                    </div>
                    {profile?.weak_areas && profile.weak_areas.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground">Weak Areas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.weak_areas.map((area: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-card/50">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{quizAttempts.length}</p>
                      <p className="text-xs text-muted-foreground">Quiz Attempts</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardContent className="p-3 text-center">
                      <p className={`text-xl font-bold ${getScoreColor(
                        quizAttempts.length > 0
                          ? Math.round(quizAttempts.reduce((s, a) => s + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / quizAttempts.length)
                          : 0
                      )}`}>
                        {quizAttempts.length > 0
                          ? `${Math.round(quizAttempts.reduce((s, a) => s + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / quizAttempts.length)}%`
                          : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{enrolledCourses.length}</p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-3">
                {quizAttempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No quiz attempts yet</div>
                ) : (
                  quizAttempts.map(a => {
                    const pct = a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0;
                    return (
                      <Card key={a.id} className="bg-card/50">
                        <CardContent className="p-3 flex items-center gap-3">
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{(a.course_quizzes as any)?.title || "Quiz"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString()} • {Math.round(a.time_taken_seconds / 60)}m
                            </p>
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(pct)}`}>
                            {a.score}/{a.total_questions} ({pct}%)
                          </span>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="courses" className="space-y-3">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Not enrolled in any courses</div>
                ) : (
                  enrolledCourses.map(e => (
                    <Card key={e.id} className="bg-card/50">
                      <CardContent className="p-3 flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{(e.courses as any)?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">{(e.courses as any)?.status}</Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
