import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, CheckCircle2, XCircle, PlayCircle, StopCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: string;
  concept: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classroomId: string;
  classroomTitle: string;
}

export default function LiveQuizDashboard({ open, onOpenChange, classroomId, classroomTitle }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topicHint, setTopicHint] = useState("");
  const [quiz, setQuiz] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    loadActiveQuiz();
  }, [open, classroomId]);

  useEffect(() => {
    if (!quiz?.id) return;
    const channel = supabase
      .channel(`live_quiz_${quiz.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "live_quiz_responses", filter: `quiz_id=eq.${quiz.id}` },
        () => loadResponses(quiz.id)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [quiz?.id]);

  const loadActiveQuiz = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("live_quizzes")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setQuiz(data);
    if (data) await loadResponses(data.id);
    setLoading(false);
  };

  const loadResponses = async (quizId: string) => {
    const { data } = await supabase
      .from("live_quiz_responses")
      .select("*")
      .eq("quiz_id", quizId);
    setResponses(data || []);
  };

  const generate = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-live-quiz", {
      body: { classroom_id: classroomId, topic_hint: topicHint },
    });
    setGenerating(false);
    if (error || data?.error) {
      toast({ title: "Generation failed", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Quiz generated", description: `${data.question_count} NBME-style questions ready.` });
    await loadActiveQuiz();
  };

  const updateStatus = async (status: string) => {
    if (!quiz) return;
    const patch: any = { status };
    if (status === "live") patch.launched_at = new Date().toISOString();
    if (status === "closed") patch.closed_at = new Date().toISOString();
    const { error } = await supabase.from("live_quizzes").update(patch).eq("id", quiz.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (status === "live") {
      // Notify enrolled students
      const { data: classroom } = await supabase
        .from("virtual_classrooms").select("course_id").eq("id", classroomId).single();
      if (classroom?.course_id) {
        const { data: enrollments } = await supabase
          .from("course_enrollments").select("student_id")
          .eq("course_id", classroom.course_id).eq("status", "approved");
        if (enrollments?.length) {
          await supabase.from("notifications").insert(
            enrollments.map(e => ({
              user_id: e.student_id,
              type: "live_quiz",
              title: "Live quiz started!",
              message: `Your instructor launched a live quiz: ${quiz.title}`,
              link: `/live-quiz/${quiz.id}`,
            }))
          );
        }
      }
    }
    await loadActiveQuiz();
  };

  const startNew = async () => {
    if (!quiz) return;
    if (!confirm("Start a new quiz? This will archive the current one.")) return;
    await supabase.from("live_quizzes").update({ status: "closed" }).eq("id", quiz.id);
    setQuiz(null);
    setResponses([]);
  };

  const questions: Question[] = quiz?.questions || [];
  const totalParticipants = new Set(responses.map(r => r.student_id)).size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            USMLE Whisperer™ — {classroomTitle}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !quiz ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Generate 5 NBME-style USMLE Step 2 CK questions tied to your lecture. ATLAS writes them in ~10 seconds, you push to enrolled students live.
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">Topic focus (optional)</label>
              <input
                value={topicHint}
                onChange={e => setTopicHint(e.target.value)}
                placeholder="e.g. STEMI management, sepsis bundles, CHF exacerbation"
                className="mt-1 w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank to use the lecture title + description.</p>
            </div>
            <Button onClick={generate} disabled={generating} className="gradient-livemed">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Quiz</>}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {questions.length} questions · <Badge variant="outline" className="ml-1">{quiz.status}</Badge>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {quiz.status === "draft" && (
                    <Button size="sm" onClick={() => updateStatus("live")} className="bg-green-600 hover:bg-green-700 text-white">
                      <PlayCircle className="h-4 w-4 mr-1.5" /> Push to Students
                    </Button>
                  )}
                  {quiz.status === "live" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus("closed")}>
                      <StopCircle className="h-4 w-4 mr-1.5" /> Close Quiz
                    </Button>
                  )}
                  {quiz.status === "closed" && (
                    <Button size="sm" variant="outline" onClick={startNew}>
                      <Sparkles className="h-4 w-4 mr-1.5" /> New Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{totalParticipants} student{totalParticipants !== 1 ? "s" : ""} responding</span>
              <span className="ml-auto">{responses.length} / {questions.length * Math.max(totalParticipants, 1)} answers</span>
            </div>

            <div className="space-y-3">
              {questions.map((q, qIdx) => {
                const qResponses = responses.filter(r => r.question_index === qIdx);
                const correctCount = qResponses.filter(r => r.is_correct).length;
                const correctPct = qResponses.length ? Math.round((correctCount / qResponses.length) * 100) : 0;
                return (
                  <Card key={qIdx} className="bg-card/30 border-border/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">Q{qIdx + 1}</span>
                            <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                            <Badge variant="secondary" className="text-xs">{q.concept}</Badge>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{q.stem}</p>
                        </div>
                        {qResponses.length > 0 && (
                          <div className={`text-right ${correctPct >= 70 ? "text-green-400" : correctPct >= 40 ? "text-amber-400" : "text-red-400"}`}>
                            <div className="text-2xl font-bold">{correctPct}%</div>
                            <div className="text-xs text-muted-foreground">correct</div>
                          </div>
                        )}
                      </div>
                      {qResponses.length > 0 && (
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const count = qResponses.filter(r => r.selected_index === oIdx).length;
                            const pct = qResponses.length ? (count / qResponses.length) * 100 : 0;
                            const isCorrect = oIdx === q.correct_answer_index;
                            return (
                              <div key={oIdx} className="flex items-center gap-2 text-xs">
                                {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />}
                                <span className="font-mono text-muted-foreground w-4">{String.fromCharCode(65 + oIdx)}.</span>
                                <span className="flex-1 truncate text-foreground/80">{opt}</span>
                                <Progress value={pct} className="w-20 h-1.5" />
                                <span className="text-muted-foreground w-10 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
