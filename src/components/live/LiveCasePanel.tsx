import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Stethoscope, Eye, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface CaseStep {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
  reveal: string;
}

interface LiveCase {
  id: string;
  title: string;
  vignette: string;
  steps: CaseStep[];
  current_step_index: number;
  revealed: boolean;
  status: string;
}

interface Props {
  classroomId: string;
  userId?: string;
  isInstructor: boolean;
}

/** Instructor-driven branching patient case with live student voting. */
export default function LiveCasePanel({ classroomId, userId, isInstructor }: Props) {
  const [liveCase, setLiveCase] = useState<LiveCase | null>(null);
  const [votes, setVotes] = useState<number[]>([]);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCase = useCallback(async () => {
    const { data } = await supabase
      .from("live_cases")
      .select("*")
      .eq("classroom_id", classroomId)
      .in("status", isInstructor ? ["draft", "live", "closed"] : ["live", "closed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setLiveCase(data ? ({ ...data, steps: (data.steps as any) || [] } as LiveCase) : null);
    setLoading(false);
  }, [classroomId, isInstructor]);

  const loadVotes = useCallback(async (c: LiveCase) => {
    const { data } = await supabase
      .from("live_case_votes")
      .select("option_index, student_id")
      .eq("case_id", c.id)
      .eq("step_index", c.current_step_index);
    const tally = new Array(c.steps[c.current_step_index]?.options.length || 0).fill(0);
    (data || []).forEach((v) => { tally[v.option_index] = (tally[v.option_index] || 0) + 1; });
    setVotes(tally);
    setMyVote((data || []).find((v) => v.student_id === userId)?.option_index ?? null);
  }, [userId]);

  useEffect(() => { loadCase(); }, [loadCase]);

  useEffect(() => {
    if (!liveCase) return;
    loadVotes(liveCase);
    const channel = supabase
      .channel(`case_${liveCase.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_cases", filter: `id=eq.${liveCase.id}` }, () => loadCase())
      .on("postgres_changes", { event: "*", schema: "public", table: "live_case_votes", filter: `case_id=eq.${liveCase.id}` }, () => loadVotes(liveCase))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [liveCase?.id, liveCase?.current_step_index, liveCase?.revealed, loadCase, loadVotes]);

  const generate = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("generate-live-case", { body: { classroom_id: classroomId } });
    setBusy(false);
    if (error || data?.error) return toast.error(data?.error || "Could not generate a case.");
    toast.success("Case ready — press Start to push it to the class.");
    loadCase();
  };

  const update = async (patch: Partial<LiveCase>) => {
    if (!liveCase) return;
    await supabase.from("live_cases").update({ ...patch, updated_at: new Date().toISOString() } as any).eq("id", liveCase.id);
    loadCase();
  };

  const vote = async (index: number) => {
    if (!liveCase || !userId || liveCase.revealed) return;
    setMyVote(index);
    await supabase.from("live_case_votes").upsert(
      { case_id: liveCase.id, step_index: liveCase.current_step_index, student_id: userId, option_index: index },
      { onConflict: "case_id,step_index,student_id" },
    );
    loadVotes(liveCase);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  if (!liveCase) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <Stethoscope className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isInstructor ? "Generate a branching patient case tied to this lecture." : "Waiting for your instructor to start a case…"}
        </p>
        {isInstructor && (
          <Button onClick={generate} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate case
          </Button>
        )}
      </div>
    );
  }

  const step = liveCase.steps[liveCase.current_step_index];
  const totalVotes = votes.reduce((a, b) => a + b, 0);
  const isLast = liveCase.current_step_index >= liveCase.steps.length - 1;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-foreground">{liveCase.title}</h3>
        <Badge variant={liveCase.status === "live" ? "default" : "secondary"}>
          {liveCase.status === "live" ? `Step ${liveCase.current_step_index + 1} of ${liveCase.steps.length}` : liveCase.status}
        </Badge>
      </div>

      <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">{liveCase.vignette}</p>

      {liveCase.status === "draft" && isInstructor && (
        <Button onClick={() => update({ status: "live", current_step_index: 0, revealed: false })}>Start case for the class</Button>
      )}

      {liveCase.status !== "draft" && step && (
        <>
          <p className="text-sm font-medium text-foreground">{step.prompt}</p>
          <div className="space-y-2">
            {step.options.map((opt, i) => {
              const pct = totalVotes ? Math.round((votes[i] / totalVotes) * 100) : 0;
              const isCorrect = liveCase.revealed && i === step.correct_index;
              const chosen = myVote === i;
              return (
                <button
                  key={i}
                  onClick={() => !isInstructor && vote(i)}
                  disabled={isInstructor || liveCase.revealed}
                  className={`relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    isCorrect ? "border-emerald-400 bg-emerald-50" : chosen ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {(liveCase.revealed || isInstructor) && (
                    <span className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${pct}%` }} aria-hidden />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                    <span className="flex-1 text-foreground">{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {(liveCase.revealed || isInstructor) && <span className="text-xs text-muted-foreground">{pct}%</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {liveCase.revealed && (
            <div className="space-y-2">
              <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">{step.explanation}</p>
              <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground">
                <span className="font-semibold">New data: </span>{step.reveal}
              </p>
            </div>
          )}

          {isInstructor && (
            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
              <span className="text-xs text-muted-foreground">{totalVotes} vote{totalVotes === 1 ? "" : "s"}</span>
              {!liveCase.revealed ? (
                <Button size="sm" onClick={() => update({ revealed: true })}>
                  <Eye className="mr-1 h-3.5 w-3.5" /> Reveal answer
                </Button>
              ) : isLast ? (
                <Button size="sm" variant="outline" onClick={() => update({ status: "closed" })}>Finish case</Button>
              ) : (
                <Button size="sm" onClick={() => update({ current_step_index: liveCase.current_step_index + 1, revealed: false })}>
                  Next step <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}