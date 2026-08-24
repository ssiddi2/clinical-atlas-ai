import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Target, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

export interface DrillRequest {
  title: string;
  focus: string[];
  subject?: string | null;
  guideId?: string | null;
}

interface Question {
  id: string;
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  subject: string;
  topic: string | null;
}

interface Props {
  request: DrillRequest | null;
  userId: string | null | undefined;
  onClose: () => void;
  onFinished?: () => void;
}

const QUESTION_COUNT = 5;

/** Journey step 3: a focused question drill pulled from the student's guide. */
const DrillSheet = ({ request, userId, onClose, onFinished }: Props) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ question_id: string; selected: number; correct: boolean }[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());

  const load = useCallback(async () => {
    if (!request || !userId) return;
    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setRevealed(false);

    const terms = [...(request.focus ?? []), request.subject].filter(Boolean).slice(0, 6) as string[];
    let rows: Question[] = [];

    if (terms.length > 0) {
      const filter = terms
        .flatMap((t) => [`subject.ilike.%${t}%`, `topic.ilike.%${t}%`, `system.ilike.%${t}%`])
        .join(",");
      const { data } = await supabase
        .from("qbank_questions")
        .select("id, stem, options, correct_answer_index, explanation, subject, topic")
        .eq("is_active", true)
        .or(filter)
        .limit(QUESTION_COUNT);
      rows = (data as unknown as Question[]) ?? [];
    }

    if (rows.length < QUESTION_COUNT) {
      const { data } = await supabase
        .from("qbank_questions")
        .select("id, stem, options, correct_answer_index, explanation, subject, topic")
        .eq("is_active", true)
        .limit(QUESTION_COUNT * 3);
      const extra = ((data as unknown as Question[]) ?? []).filter((q) => !rows.some((r) => r.id === q.id));
      rows = [...rows, ...extra].slice(0, QUESTION_COUNT);
    }

    setQuestions(rows);
    setStartedAt(Date.now());

    if (rows.length > 0) {
      const { data: drill } = await supabase
        .from("guide_drills")
        .insert({
          user_id: userId,
          guide_id: request.guideId ?? null,
          filters: { focus: request.focus, subject: request.subject ?? null },
          question_ids: rows.map((r) => r.id),
          total_questions: rows.length,
        })
        .select("id")
        .single();
      setDrillId(drill?.id ?? null);
    }
    setLoading(false);
  }, [request, userId]);

  useEffect(() => { if (request) load(); }, [request, load]);

  const current = questions[index];
  const correctCount = answers.filter((a) => a.correct).length;
  const finished = questions.length > 0 && answers.length === questions.length && revealed && index === questions.length - 1;

  const submit = async () => {
    if (selected === null || !current || !userId) return;
    const correct = selected === current.correct_answer_index;
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setRevealed(true);
    const nextAnswers = [...answers, { question_id: current.id, selected, correct }];
    setAnswers(nextAnswers);

    await supabase.from("qbank_user_progress").insert({
      user_id: userId,
      question_id: current.id,
      attempt_number: 1,
      selected_answer: selected,
      is_correct: correct,
      time_spent_seconds: seconds,
    });

    if (drillId) {
      const done = nextAnswers.length === questions.length;
      await supabase.from("guide_drills").update({
        answers: nextAnswers,
        correct_count: nextAnswers.filter((a) => a.correct).length,
        status: done ? "completed" : "in_progress",
        completed_at: done ? new Date().toISOString() : null,
      }).eq("id", drillId);
      if (done) {
        toast({
          title: "Drill complete",
          description: `${nextAnswers.filter((a) => a.correct).length}/${questions.length} correct — logged to your QBank history.`,
        });
        onFinished?.();
      }
    }
  };

  const next = () => {
    setSelected(null);
    setRevealed(false);
    setStartedAt(Date.now());
    setIndex((i) => Math.min(questions.length - 1, i + 1));
  };

  return (
    <Sheet open={!!request} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> {request?.title ?? "Drill"}
          </SheetTitle>
          <SheetDescription>
            {questions.length > 0
              ? `Question ${index + 1} of ${questions.length} · ${correctCount} correct so far`
              : "Pulling questions matched to this guide…"}
          </SheetDescription>
        </SheetHeader>

        {(request?.focus?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {request!.focus.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
            <Loader2 className="h-4 w-4 animate-spin" /> Building your drill…
          </div>
        ) : questions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12">
            No question bank items match this topic yet. Try the full QBank instead.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <Progress value={((index + (revealed ? 1 : 0)) / questions.length) * 100} className="h-1.5" />
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{current?.stem}</p>
            <div className="space-y-2">
              {(current?.options ?? []).map((opt, i) => {
                const isCorrect = i === current!.correct_answer_index;
                const state = revealed
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-500/10"
                    : i === selected ? "border-destructive bg-destructive/10" : "border-border"
                  : i === selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted";
                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left text-sm rounded-xl border p-3 transition-colors flex gap-2 ${state}`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                    {revealed && !isCorrect && i === selected && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="rounded-xl bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Explanation</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{current?.explanation}</p>
              </div>
            )}

            <div className="flex gap-2">
              {!revealed ? (
                <Button className="rounded-full" disabled={selected === null} onClick={submit}>
                  Check answer
                </Button>
              ) : index < questions.length - 1 ? (
                <Button className="rounded-full" onClick={next}>Next question</Button>
              ) : (
                <Button className="rounded-full" onClick={onClose}>
                  Finish · {correctCount}/{questions.length}
                </Button>
              )}
            </div>
            {finished && (
              <p className="text-xs text-muted-foreground">
                Results are saved to your QBank history and feed the score predictor.
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DrillSheet;
