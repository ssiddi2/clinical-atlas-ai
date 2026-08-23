import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuestionPlayer, { type PlayerQuestion } from "./QuestionPlayer";
import SessionItemEditor from "./SessionItemEditor";
import { DEFAULT_STEPS, STEP_COUNT_LABEL, youtubeEmbed, type SessionItem, type SessionStep, type StepKey } from "./sessionSteps";

interface Props {
  topicId: string;
  isInstructor: boolean;
}

export default function LearningUnitSession({ topicId, isInstructor }: Props) {
  const { toast } = useToast();
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [questions, setQuestions] = useState<PlayerQuestion[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ stepId: string; stepKey: StepKey; item: SessionItem | null } | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [s, q, p] = await Promise.all([
      supabase.from("learning_unit_steps").select("*").eq("topic_id", topicId).order("sort_order"),
      supabase.from("learning_unit_questions").select("*").eq("topic_id", topicId).order("sort_order"),
      user ? supabase.from("learning_unit_step_progress").select("step_id").eq("student_id", user.id) : Promise.resolve({ data: [] as any[] }),
    ]);
    const stepRows = (s.data ?? []) as SessionStep[];
    setSteps(stepRows);
    setQuestions((q.data ?? []) as PlayerQuestion[]);
    setDone(new Set(((p as any).data ?? []).map((r: any) => r.step_id)));
    if (stepRows.length) {
      const { data } = await supabase
        .from("learning_unit_step_items").select("*")
        .in("step_id", stepRows.map(r => r.id)).order("sort_order");
      setItems((data ?? []) as SessionItem[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [topicId]);

  useEffect(() => { load(); }, [load]);

  const itemsOf = (stepId: string) => items.filter(i => i.step_id === stepId);
  const countOf = (step: SessionStep) => (step.step_key === "mcqs" ? questions.length : itemsOf(step.id).length);
  const totalMinutes = steps.reduce((a, s) => a + s.duration_minutes, 0);

  const toggleDone = async (stepId: string, next: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (next) {
      await supabase.from("learning_unit_step_progress").insert({ step_id: stepId, student_id: user.id });
      setDone(prev => new Set(prev).add(stepId));
    } else {
      await supabase.from("learning_unit_step_progress").delete().eq("step_id", stepId).eq("student_id", user.id);
      setDone(prev => { const n = new Set(prev); n.delete(stepId); return n; });
    }
  };

  const createPlan = async () => {
    const { error } = await supabase.from("learning_unit_steps").insert(
      DEFAULT_STEPS.map(s => ({ ...s, topic_id: topicId })),
    );
    if (error) return toast({ title: "Could not create plan", description: error.message, variant: "destructive" });
    load();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("learning_unit_step_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!steps.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-muted-foreground">No session plan for this unit yet.</p>
          {isInstructor && <Button onClick={createPlan}>Create the 6-step session plan</Button>}
        </CardContent>
      </Card>
    );
  }

  const renderItems = (step: SessionStep) => {
    const list = itemsOf(step.id);
    const editBar = (item: SessionItem) => isInstructor && (
      <span className="ml-auto flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing({ stepId: step.id, stepKey: step.step_key, item })}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </span>
    );

    switch (step.step_key) {
      case "objectives":
        return (
          <ol className="space-y-2 list-decimal pl-5 text-sm">
            {list.map(i => <li key={i.id}><span className="flex items-start"><span className="flex-1">{i.title}</span>{editBar(i)}</span></li>)}
          </ol>
        );
      case "reading":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map(i => (
              <div key={i.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{i.title}</p>
                    {i.source && <p className="text-xs text-muted-foreground">{i.source}</p>}
                  </div>
                  {editBar(i)}
                </div>
                {i.url && (
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Open <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        );
      case "videos":
        return (
          <div className="space-y-4">
            {list.map((i, idx) => {
              const embed = youtubeEmbed(i.url);
              return (
                <div key={i.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-muted-foreground pt-0.5">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{i.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {[i.subtitle, i.duration_label].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {editBar(i)}
                  </div>
                  {embed && (
                    <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <iframe src={embed} title={i.title ?? "Video"} loading="lazy" allowFullScreen
                        className="h-full w-full" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" />
                    </div>
                  )}
                  {i.url && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open the source</a>
                      {i.source && ` · Courtesy of ${i.source}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      case "images":
        return (
          <Accordion type="single" collapsible className="space-y-2">
            {list.map(i => (
              <AccordionItem key={i.id} value={i.id} className="rounded-xl border border-border px-3">
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex items-center gap-3 text-left">
                    {i.image_url && <img src={i.image_url} alt={i.title ?? ""} loading="lazy" className="h-14 w-14 rounded-lg object-cover bg-muted" />}
                    <span>
                      <span className="block text-sm font-semibold">{i.title}</span>
                      {i.subtitle && <span className="block text-xs text-muted-foreground">{i.subtitle}</span>}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {i.image_url && <img src={i.image_url} alt={i.title ?? ""} loading="lazy" className="w-full max-w-md rounded-lg bg-black" />}
                  {i.body && <p className="text-sm text-muted-foreground">{i.body}</p>}
                  <div className="flex items-center gap-2">
                    {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open the original</a>}
                    {editBar(i)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        );
      case "discussion":
        return (
          <ul className="space-y-2 text-sm">
            {list.map(i => (
              <li key={i.id} className="flex gap-2">
                {i.subtitle && <span className="text-muted-foreground shrink-0">{i.subtitle}</span>}
                <span className="flex-1">{i.title}</span>
                {editBar(i)}
              </li>
            ))}
          </ul>
        );
      case "mcqs":
        return questions.length
          ? <QuestionPlayer topicId={topicId} questions={questions} />
          : <p className="text-sm text-muted-foreground">No questions added to this unit yet.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground">BEFORE THE SESSION</p>
            <h2 className="text-lg font-bold">What you need to do</h2>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{done.size} of {steps.length} done</p>
            <Progress value={(done.size / steps.length) * 100} />
            <p className="text-xs text-muted-foreground">about {totalMinutes} min total</p>
          </div>
          <div className="divide-y divide-border">
            {steps.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-3">
                <Checkbox checked={done.has(s.id)} onCheckedChange={v => toggleDone(s.id, !!v)} aria-label={s.title} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{STEP_COUNT_LABEL[s.step_key](countOf(s))}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{s.duration_minutes} min</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {steps.map((s, idx) => (
        <Card key={s.id}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground">STEP {idx + 1}</p>
                <h3 className="text-base font-bold">{s.title}</h3>
                {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
              </div>
              {isInstructor && s.step_key !== "mcqs" && (
                <Button variant="outline" size="sm" onClick={() => setEditing({ stepId: s.id, stepKey: s.step_key, item: null })}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Add
                </Button>
              )}
            </div>
            {renderItems(s)}
          </CardContent>
        </Card>
      ))}

      {editing && (
        <SessionItemEditor
          open
          onOpenChange={v => !v && setEditing(null)}
          stepId={editing.stepId}
          stepKey={editing.stepKey}
          item={editing.item}
          nextOrder={itemsOf(editing.stepId).length}
          onSaved={load}
        />
      )}
    </div>
  );
}
