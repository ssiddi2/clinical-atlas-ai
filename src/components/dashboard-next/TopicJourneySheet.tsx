import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, Circle, Flame, Loader2, MessageSquare, NotebookPen, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PredictiveCard } from "./types";

interface Props {
  card: PredictiveCard | null;
  userId: string | null | undefined;
  onClose: () => void;
  onAskAtlas: (card: PredictiveCard) => void;
  onStudyGuide: (card: PredictiveCard) => void;
  onDrill: (card: PredictiveCard) => void;
}

interface Step {
  id: string;
  step_key: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  sort_order: number;
  done: boolean;
}

/** Journey: resume topic → session steps → mastery. */
const TopicJourneySheet = ({ card, userId, onClose, onAskAtlas, onStudyGuide, onDrill }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [meta, setMeta] = useState<{
    title: string;
    course: string | null;
    highYield: boolean;
    quickNotes: string | null;
    examTraps: string | null;
    quizScore: number | null;
    attempts: number;
    timeSpent: number;
    questionCount: number;
  } | null>(null);

  const load = useCallback(async () => {
    const topicId = card?.topicId;
    if (!topicId || !userId) return;
    setLoading(true);

    const [topicRes, contentRes, stepsRes, progressRes, questionsRes] = await Promise.all([
      supabase.from("course_topics").select("title, is_high_yield, course_id").eq("id", topicId).maybeSingle(),
      supabase.from("learning_unit_content").select("quick_notes, exam_traps, passing_score").eq("topic_id", topicId).maybeSingle(),
      supabase.from("learning_unit_steps").select("id, step_key, title, description, duration_minutes, sort_order").eq("topic_id", topicId).order("sort_order"),
      supabase.from("learning_unit_progress").select("quiz_score, attempts, time_spent_seconds, completed").eq("topic_id", topicId).eq("student_id", userId).maybeSingle(),
      supabase.from("learning_unit_questions").select("id", { count: "exact", head: true }).eq("topic_id", topicId),
    ]);

    const stepIds = (stepsRes.data ?? []).map((s) => s.id);
    let doneIds = new Set<string>();
    if (stepIds.length > 0) {
      const { data } = await supabase
        .from("learning_unit_step_progress")
        .select("step_id")
        .eq("student_id", userId)
        .in("step_id", stepIds);
      doneIds = new Set((data ?? []).map((d) => d.step_id));
    }

    let courseTitle: string | null = null;
    if (topicRes.data?.course_id) {
      const { data } = await supabase.from("courses").select("title").eq("id", topicRes.data.course_id).maybeSingle();
      courseTitle = data?.title ?? null;
    }

    setSteps((stepsRes.data ?? []).map((s) => ({ ...s, done: doneIds.has(s.id) })));
    setMeta({
      title: topicRes.data?.title ?? card.title,
      course: courseTitle,
      highYield: !!topicRes.data?.is_high_yield,
      quickNotes: contentRes.data?.quick_notes ?? null,
      examTraps: contentRes.data?.exam_traps ?? null,
      quizScore: progressRes.data?.quiz_score ?? null,
      attempts: progressRes.data?.attempts ?? 0,
      timeSpent: progressRes.data?.time_spent_seconds ?? 0,
      questionCount: questionsRes.count ?? 0,
    });
    setLoading(false);
  }, [card, userId]);

  useEffect(() => { if (card?.topicId) load(); }, [card, load]);

  const completed = steps.filter((s) => s.done).length;
  const stepPct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  const mastery = meta?.quizScore ?? null;

  return (
    <Sheet open={!!card} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <span>{meta?.title ?? card?.title}</span>
          </SheetTitle>
          <SheetDescription>{meta?.course ?? card?.eyebrow}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your unit progress…
          </div>
        ) : (
          <div className="mt-4 space-y-5 pb-10">
            <div className="flex flex-wrap gap-1.5">
              {meta?.highYield && <Badge className="bg-amber-500 text-white">High yield</Badge>}
              <Badge variant="secondary">{meta?.questionCount ?? 0} unit questions</Badge>
              {meta && meta.timeSpent > 0 && (
                <Badge variant="secondary">{Math.round(meta.timeSpent / 60)} min spent</Badge>
              )}
              {meta && meta.attempts > 0 && <Badge variant="secondary">{meta.attempts} attempts</Badge>}
            </div>

            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Session steps</span>
                <span className="text-muted-foreground">{completed}/{steps.length || 0} done</span>
              </div>
              <Progress value={stepPct} className="h-1.5" />
              <ul className="space-y-2 mt-1">
                {steps.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    This unit has no guided session yet — open it to work through the content.
                  </li>
                )}
                {steps.map((s) => (
                  <li key={s.id} className="flex items-start gap-2 text-sm">
                    {s.done
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                    <span className="flex-1">
                      <span className={s.done ? "text-muted-foreground line-through" : ""}>{s.title}</span>
                      {s.description && <span className="block text-xs text-muted-foreground">{s.description}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{s.duration_minutes}m</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" /> Mastery
                </span>
                <span className="text-muted-foreground">
                  {mastery === null ? "Not attempted" : `${mastery}%`}
                </span>
              </div>
              <Progress value={mastery ?? 0} className="h-1.5 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {mastery === null
                  ? "Pass the unit quiz at 70% to unlock the next unit."
                  : mastery >= 70
                    ? "Passed — the next unit is unlocked."
                    : "Below the 70% gate. Drill the weak concepts, then retake."}
              </p>
            </div>

            {(meta?.quickNotes || meta?.examTraps) && (
              <div className="rounded-2xl bg-muted p-4 space-y-3 text-sm">
                {meta?.quickNotes && (
                  <div>
                    <p className="font-medium mb-1">Quick notes</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{meta.quickNotes}</p>
                  </div>
                )}
                {meta?.examTraps && (
                  <div>
                    <p className="font-medium mb-1">Exam traps</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{meta.examTraps}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={() => navigate(`/learning-unit/${card!.topicId}`)}>
                {completed > 0 ? "Resume unit" : "Start unit"}
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => onDrill(card!)}>
                <Target className="h-3.5 w-3.5 mr-1.5" /> Drill questions
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => onStudyGuide(card!)}>
                <NotebookPen className="h-3.5 w-3.5 mr-1.5" /> Study guide
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => onAskAtlas(card!)}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Ask ATLAS
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TopicJourneySheet;
