import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, Loader2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LiveQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { navigate("/auth"); return; }
      setUser(u);
      await load(u.id);
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`student_quiz_${id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_quizzes", filter: `id=eq.${id}` },
        (payload: any) => setQuiz(payload.new)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const load = async (userId: string) => {
    setLoading(true);
    const [{ data: q }, { data: r }] = await Promise.all([
      supabase.from("live_quizzes").select("*").eq("id", id).single(),
      supabase.from("live_quiz_responses").select("*").eq("quiz_id", id).eq("student_id", userId),
    ]);
    setQuiz(q);
    setResponses(r || []);
    // resume on next unanswered question
    const answered = new Set((r || []).map(x => x.question_index));
    const next = (q?.questions || []).findIndex((_: any, idx: number) => !answered.has(idx));
    setCurrentIdx(next === -1 ? (q?.questions?.length || 1) - 1 : next);
    setQuestionStartTime(Date.now());
    setLoading(false);
  };

  const submit = async () => {
    if (selected === null || !quiz || !user) return;
    const q = quiz.questions[currentIdx];
    const isCorrect = selected === q.correct_answer_index;
    const time = Math.round((Date.now() - questionStartTime) / 1000);
    const { error } = await supabase.from("live_quiz_responses").insert({
      quiz_id: quiz.id,
      student_id: user.id,
      question_index: currentIdx,
      selected_index: selected,
      is_correct: isCorrect,
      time_taken_seconds: time,
    });
    if (error) {
      toast({ title: "Submit failed", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    setResponses(prev => [...prev, { question_index: currentIdx, selected_index: selected, is_correct: isCorrect }]);
  };

  const next = () => {
    setSelected(null);
    setSubmitted(false);
    setCurrentIdx(i => i + 1);
    setQuestionStartTime(Date.now());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">Quiz not found or no longer available.</p>
        <Button onClick={() => navigate("/dashboard")}><ArrowLeft className="h-4 w-4 mr-2" /> Dashboard</Button>
      </div>
    );
  }

  if (quiz.status === "draft") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="h-10 w-10 text-primary mb-3" />
        <h2 className="text-xl font-semibold text-foreground">Quiz not yet started</h2>
        <p className="text-muted-foreground mt-2 mb-4">Your instructor will push the questions when ready.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const total = questions.length;
  const answered = responses.length;
  const allDone = answered >= total;

  if (allDone) {
    const correct = responses.filter(r => r.is_correct).length;
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Trophy className={`h-14 w-14 mb-4 ${pct >= 70 ? "text-green-400" : pct >= 50 ? "text-amber-400" : "text-red-400"}`} />
        <h1 className="text-3xl font-bold text-foreground">{correct} / {total} correct</h1>
        <p className="text-muted-foreground mt-2">{pct}% on this live quiz</p>
        <Button className="mt-6" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Exit
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Question {currentIdx + 1} of {total}</span>
          </div>
        </div>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{q.difficulty}</Badge>
              <Badge variant="secondary">{q.concept}</Badge>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{q.stem}</p>

            <div className="space-y-2">
              {q.options.map((opt: string, oIdx: number) => {
                const isSelected = selected === oIdx;
                const isCorrect = oIdx === q.correct_answer_index;
                let cls = "border-border/30 hover:border-border/60 hover:bg-card/80";
                if (submitted) {
                  if (isCorrect) cls = "border-green-500/50 bg-green-500/10";
                  else if (isSelected) cls = "border-red-500/50 bg-red-500/10";
                  else cls = "border-border/20 opacity-60";
                } else if (isSelected) {
                  cls = "border-primary bg-primary/10";
                }
                return (
                  <button
                    key={oIdx}
                    disabled={submitted}
                    onClick={() => setSelected(oIdx)}
                    className={`w-full text-left rounded-lg border p-3 transition-all flex items-start gap-3 ${cls}`}
                  >
                    <span className="font-mono text-sm text-muted-foreground shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                    <span className="flex-1 text-sm text-foreground">{opt}</span>
                    {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="rounded-lg bg-card/80 border border-border/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Explanation</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{q.explanation}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              {!submitted ? (
                <Button onClick={submit} disabled={selected === null} className="gradient-livemed">
                  Submit Answer
                </Button>
              ) : currentIdx < total - 1 ? (
                <Button onClick={next} className="gradient-livemed">Next Question</Button>
              ) : (
                <Button onClick={next} className="gradient-livemed">See Results</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
