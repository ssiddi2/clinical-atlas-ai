import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  CalendarCheck, CheckCircle2, Clock, Loader2, MessageSquare, Radio, Sparkles, Users, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import type { PredictiveCard } from "./types";

interface QuizItem {
  stem: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface Debrief {
  id: string;
  summary: string | null;
  weak_concepts: string[];
  quiz: QuizItem[];
  quiz_score: number | null;
  attendance_seconds: number;
}

interface Props {
  card: PredictiveCard | null;
  userId: string | null | undefined;
  onClose: () => void;
  onAskAtlas: (card: PredictiveCard) => void;
  onDrill: (card: PredictiveCard, focus: string[]) => void;
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lecture-debrief`;

/** Journey: live lecture → join → post-lecture debrief + remediation quiz. */
const LectureJourneySheet = ({ card, userId, onClose, onAskAtlas, onDrill }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lecture, setLecture] = useState<{
    id: string; title: string; description: string | null;
    scheduled_start: string; scheduled_end: string; status: string;
  } | null>(null);
  const [attendees, setAttendees] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);

  const load = useCallback(async () => {
    const id = card?.classroomId;
    if (!id || !userId) return;
    setLoading(true);
    setGraded(false);
    setAnswers({});

    const [lectureRes, presenceRes, countRes, debriefRes] = await Promise.all([
      supabase.from("virtual_classrooms")
        .select("id, title, description, scheduled_start, scheduled_end, status").eq("id", id).maybeSingle(),
      supabase.from("classroom_presence").select("accumulated_seconds").eq("classroom_id", id).eq("user_id", userId).maybeSingle(),
      supabase.from("classroom_enrollments").select("id", { count: "exact", head: true }).eq("classroom_id", id),
      supabase.from("lecture_debriefs").select("id, summary, weak_concepts, quiz, quiz_score, attendance_seconds")
        .eq("classroom_id", id).eq("student_id", userId).maybeSingle(),
    ]);

    setLecture(lectureRes.data ?? null);
    setMinutes(Math.round((presenceRes.data?.accumulated_seconds ?? 0) / 60));
    setAttendees(countRes.count ?? 0);
    setDebrief(debriefRes.data ? (debriefRes.data as unknown as Debrief) : null);
    if (debriefRes.data?.quiz_score !== null && debriefRes.data?.quiz_score !== undefined) setGraded(true);
    setLoading(false);
  }, [card, userId]);

  useEffect(() => { if (card?.classroomId) load(); }, [card, load]);

  // Live status changes should reach the student without a refresh.
  useEffect(() => {
    const id = card?.classroomId;
    if (!id) return;
    const channel = supabase
      .channel(`lecture-journey-${id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "virtual_classrooms", filter: `id=eq.${id}` },
        (payload) => setLecture((prev) => (prev ? { ...prev, ...(payload.new as typeof prev) } : prev)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [card?.classroomId]);

  const join = async () => {
    if (!card?.classroomId || !userId) return;
    // Self-enrol so presence and the debrief have a roster row to hang off.
    await supabase.from("classroom_enrollments")
      .upsert({ classroom_id: card.classroomId, student_id: userId }, { onConflict: "classroom_id,student_id" });
    navigate(`/studio/${card.classroomId}`);
  };

  const generateDebrief = async () => {
    if (!card?.classroomId) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const resp = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ classroomId: card.classroomId }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast({
          title: "Debrief unavailable",
          description: payload.error ?? "ATLAS could not build the debrief right now.",
          variant: "destructive",
        });
        return;
      }
      setDebrief(payload.debrief as Debrief);
    } finally {
      setGenerating(false);
    }
  };

  const gradeQuiz = async () => {
    if (!debrief) return;
    const total = debrief.quiz.length;
    const correct = debrief.quiz.filter((q, i) => answers[i] === q.correct_index).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    setGraded(true);
    setDebrief({ ...debrief, quiz_score: score });
    await supabase.from("lecture_debriefs")
      .update({ quiz_answers: debrief.quiz.map((_, i) => answers[i] ?? null), quiz_score: score })
      .eq("id", debrief.id);
    toast({ title: `Remediation quiz: ${score}%`, description: `${correct} of ${total} correct.` });
  };

  const isLive = lecture?.status === "live";
  const isPast = lecture ? new Date(lecture.scheduled_end).getTime() < Date.now() || lecture.status === "completed" : false;
  const answeredAll = debrief ? Object.keys(answers).length === debrief.quiz.length && debrief.quiz.length > 0 : false;

  return (
    <Sheet open={!!card} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-start gap-2">
            {isLive
              ? <Radio className="h-4 w-4 text-rose-500 mt-1 flex-shrink-0" />
              : <CalendarCheck className="h-4 w-4 text-primary mt-1 flex-shrink-0" />}
            <span>{lecture?.title ?? card?.title}</span>
          </SheetTitle>
          <SheetDescription>
            {lecture
              ? new Date(lecture.scheduled_start).toLocaleString(undefined, {
                  weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                })
              : card?.body}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading the lecture…
          </div>
        ) : (
          <div className="mt-4 space-y-5 pb-10">
            <div className="flex flex-wrap gap-1.5">
              {isLive && <Badge className="bg-rose-500 text-white">Live now</Badge>}
              {isPast && !isLive && <Badge variant="secondary">Ended</Badge>}
              <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{attendees} enrolled</Badge>
              {minutes > 0 && <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{minutes} min attended</Badge>}
            </div>

            {lecture?.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lecture.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {!isPast && (
                <Button className="rounded-full" onClick={join}>
                  {isLive ? "Join live now" : "Open lecture room"}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => onAskAtlas(card!)}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Ask ATLAS
              </Button>
            </div>

            <div className="rounded-2xl border border-border p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Post-lecture debrief
              </p>

              {!debrief ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {isPast || minutes > 0
                      ? "ATLAS recaps the lecture, names what you should shore up, and builds a 5-question remediation quiz."
                      : "Available once you've attended — ATLAS will recap the lecture and quiz you on it."}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={generating || (!isPast && minutes === 0)}
                    onClick={generateDebrief}
                  >
                    {generating
                      ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Building debrief…</>
                      : "Generate debrief"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {debrief.summary && (
                    <article className="prose prose-sm max-w-none">
                      <ReactMarkdown>{debrief.summary}</ReactMarkdown>
                    </article>
                  )}

                  {debrief.weak_concepts?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {debrief.weak_concepts.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                  )}

                  {debrief.quiz?.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium">Remediation quiz</p>
                      {debrief.quiz.map((q, qi) => (
                        <div key={qi} className="space-y-2">
                          <p className="text-sm">{qi + 1}. {q.stem}</p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oi) => {
                              const chosen = answers[qi] === oi;
                              const state = graded
                                ? oi === q.correct_index
                                  ? "border-emerald-500 bg-emerald-500/10"
                                  : chosen ? "border-destructive bg-destructive/10" : "border-border"
                                : chosen ? "border-primary bg-primary/5" : "border-border hover:bg-muted";
                              return (
                                <button
                                  key={oi}
                                  disabled={graded}
                                  onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                                  className={`w-full text-left text-sm rounded-xl border p-2.5 transition-colors flex gap-2 ${state}`}
                                >
                                  <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span>
                                  <span className="flex-1">{opt}</span>
                                  {graded && oi === q.correct_index && <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                                  {graded && chosen && oi !== q.correct_index && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                          {graded && (
                            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">{q.explanation}</p>
                          )}
                        </div>
                      ))}

                      {!graded ? (
                        <Button size="sm" className="rounded-full" disabled={!answeredAll} onClick={gradeQuiz}>
                          Submit quiz
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Progress value={debrief.quiz_score ?? 0} className="h-1.5" />
                          <p className="text-sm">
                            Score: <span className="font-semibold">{debrief.quiz_score}%</span>
                          </p>
                          {(debrief.weak_concepts?.length ?? 0) > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => onDrill(card!, debrief.weak_concepts)}
                            >
                              Drill these concepts
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LectureJourneySheet;
