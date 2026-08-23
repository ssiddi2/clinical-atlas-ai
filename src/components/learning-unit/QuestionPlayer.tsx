import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, ChevronRight, RotateCcw, Eye } from "lucide-react";
import RadiologyImageViewer from "@/components/radiology/RadiologyImageViewer";

export interface PlayerQuestion {
  id: string;
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string | null;
  difficulty: string | null;
  concept_tag: string | null;
  image_url?: string | null;
  modality?: string | null;
  body_region?: string | null;
  findings?: string | null;
}

interface Props {
  topicId: string;
  questions: PlayerQuestion[];
}

export default function QuestionPlayer({ topicId, questions }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showFindings, setShowFindings] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedAt = useMemo(() => Date.now(), []);

  const q = questions[index];
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(qq => answers[qq.id] === qq.correct_answer_index).length;
  const scorePercent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const submit = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setAnswers(a => ({ ...a, [q.id]: i }));
  };

  const finish = async (finalAnswers: Record<string, number>) => {
    const correct = questions.filter(qq => finalAnswers[qq.id] === qq.correct_answer_index).length;
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("learning_unit_progress").upsert({
        student_id: user.id,
        topic_id: topicId,
        quiz_score: score,
        quiz_answers: finalAnswers,
        time_spent_seconds: Math.round((Date.now() - startedAt) / 1000),
        completed: score >= 70,
        last_attempt_at: new Date().toISOString(),
      }, { onConflict: "student_id,topic_id" });
    }
    setFinished(true);
  };

  const next = () => {
    const updated = { ...answers, [q.id]: selected as number };
    setSelected(null);
    setShowFindings(false);
    if (index + 1 >= questions.length) {
      finish(updated);
    } else {
      setIndex(i => i + 1);
    }
  };

  const restart = () => {
    setIndex(0); setSelected(null); setAnswers({}); setShowFindings(false); setFinished(false);
  };

  if (finished) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Case set complete</p>
          <p className="text-5xl font-bold">{scorePercent}%</p>
          <p className="text-sm text-muted-foreground">
            {correctCount} of {questions.length} correct · {scorePercent >= 70 ? "Unit passed" : "70% needed to unlock the next unit"}
          </p>
          <Button onClick={restart} variant="outline">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCorrect = selected !== null && selected === q.correct_answer_index;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Case {index + 1} of {questions.length}</span>
          <span>{answeredCount ? `${correctCount}/${answeredCount} correct` : "Read the study, then answer"}</span>
        </div>
        <Progress value={((index) / questions.length) * 100} className="h-1.5" />
      </div>

      <div className={q.image_url ? "grid gap-5 lg:grid-cols-2" : ""}>
        {q.image_url && (
          <div className="space-y-2">
            <RadiologyImageViewer path={q.image_url} alt={q.body_region || "Radiology study"} />
            <div className="flex gap-1.5 flex-wrap">
              {q.modality && <Badge variant="outline" className="text-[10px]">{q.modality}</Badge>}
              {q.body_region && <Badge variant="outline" className="text-[10px]">{q.body_region}</Badge>}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium leading-relaxed">{q.stem}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const chosen = selected === i;
              const correct = selected !== null && i === q.correct_answer_index;
              return (
                <button
                  key={i}
                  onClick={() => submit(i)}
                  disabled={selected !== null}
                  className={`w-full text-left text-sm rounded-xl border px-3 py-2.5 transition-colors flex items-start gap-2.5
                    ${correct ? "border-green-500/50 bg-green-500/10" : chosen ? "border-destructive/50 bg-destructive/10" : "border-border hover:border-primary/40"}`}
                >
                  <span className="font-semibold shrink-0">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1">{opt}</span>
                  {correct && <Check className="h-4 w-4 text-green-500 shrink-0" />}
                  {chosen && !correct && <X className="h-4 w-4 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-3">
              <p className={`text-sm font-semibold ${isCorrect ? "text-green-600" : "text-destructive"}`}>
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              {q.explanation && <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>}
              {q.findings && (
                showFindings ? (
                  <div>
                    <p className="text-xs font-semibold mb-1">Radiologic findings</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{q.findings}</p>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setShowFindings(true)}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Reveal findings
                  </Button>
                )
              )}
              <Button size="sm" onClick={next} className="w-full">
                {index + 1 >= questions.length ? "Finish" : "Next case"}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
