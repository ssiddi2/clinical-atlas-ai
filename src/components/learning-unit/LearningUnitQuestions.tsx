import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RadiologyImageUpload from "@/components/radiology/RadiologyImageUpload";
import QuestionPlayer from "./QuestionPlayer";

interface Question {
  id: string;
  stem: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: string;
  concept_tag: string;
  exam_relevance: string;
  sort_order: number;
  image_url: string | null;
  modality: string | null;
  body_region: string | null;
  findings: string | null;
}

interface Props {
  topicId: string;
  courseId: string;
  isInstructor: boolean;
}

const EMPTY_QUESTION = {
  stem: "",
  options: ["", "", "", "", ""],
  correct_answer_index: 0,
  explanation: "",
  difficulty: "medium",
  concept_tag: "",
  exam_relevance: "medium",
  image_url: null as string | null,
  modality: "",
  body_region: "",
  findings: "",
};

export default function LearningUnitQuestions({ topicId, courseId, isInstructor }: Props) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_QUESTION>(EMPTY_QUESTION);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("learning_unit_questions")
      .select("*")
      .eq("topic_id", topicId)
      .order("sort_order");
    if (data) setQuestions(data.map(q => ({ ...q, options: q.options as string[] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [topicId]);

  const handleSave = async () => {
    if (!form.stem.trim() || form.options.filter(o => o.trim()).length < 2) {
      toast({ title: "Please fill in the question stem and at least 2 options", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      topic_id: topicId,
      stem: form.stem,
      options: form.options.filter(o => o.trim()),
      correct_answer_index: form.correct_answer_index,
      explanation: form.explanation,
      difficulty: form.difficulty,
      concept_tag: form.concept_tag,
      exam_relevance: form.exam_relevance,
      image_url: form.image_url,
      modality: form.modality || null,
      body_region: form.body_region || null,
      findings: form.findings || null,
      created_by: user.id,
      sort_order: editingId ? questions.find(q => q.id === editingId)?.sort_order || 0 : questions.length,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("learning_unit_questions").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("learning_unit_questions").insert(payload));
    }

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Question updated" : "Question created" });
      setEditingId(null);
      setCreating(false);
      setForm(EMPTY_QUESTION);
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("learning_unit_questions").delete().eq("id", id);
    toast({ title: "Question deleted" });
    load();
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setCreating(false);
    const opts = [...q.options];
    while (opts.length < 5) opts.push("");
    setForm({
      stem: q.stem,
      options: opts,
      correct_answer_index: q.correct_answer_index,
      explanation: q.explanation,
      difficulty: q.difficulty,
      concept_tag: q.concept_tag,
      exam_relevance: q.exam_relevance,
      image_url: q.image_url,
      modality: q.modality || "",
      body_region: q.body_region || "",
      findings: q.findings || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCreating(false);
    setForm(EMPTY_QUESTION);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const showEditor = creating || editingId;

  if (!isInstructor) {
    if (questions.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No cases for this unit yet.</p>;
    }
    return <QuestionPlayer topicId={topicId} questions={questions} />;
  }

  return (
    <div className="space-y-4">
      {isInstructor && !showEditor && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { setCreating(true); setForm(EMPTY_QUESTION); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
          </Button>
        </div>
      )}

      {showEditor && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit Question" : "New Question"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Question Stem</Label>
              <Textarea
                value={form.stem}
                onChange={e => setForm(f => ({ ...f, stem: e.target.value }))}
                placeholder="A 45-year-old male presents with..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Options (mark correct answer)</Label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={form.correct_answer_index === i ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setForm(f => ({ ...f, correct_answer_index: i }))}
                  >
                    {String.fromCharCode(65 + i)}
                  </Button>
                  <Input
                    value={opt}
                    onChange={e => {
                      const opts = [...form.options];
                      opts[i] = e.target.value;
                      setForm(f => ({ ...f, options: opts }));
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="h-8"
                  />
                  {form.correct_answer_index === i && <Check className="h-4 w-4 text-green-400 shrink-0" />}
                </div>
              ))}
            </div>
            <div>
              <Label className="mb-1.5 block">Radiology Image (optional)</Label>
              <RadiologyImageUpload
                courseId={courseId}
                topicId={topicId}
                value={form.image_url}
                onChange={path => setForm(f => ({ ...f, image_url: path }))}
              />
            </div>
            {form.image_url && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Modality</Label>
                  <Select value={form.modality || "X-ray"} onValueChange={v => setForm(f => ({ ...f, modality: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="X-ray">X-ray</SelectItem>
                      <SelectItem value="CT">CT</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="Nuclear">Nuclear medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Body Region</Label>
                  <Input value={form.body_region} onChange={e => setForm(f => ({ ...f, body_region: e.target.value }))} placeholder="e.g. Chest PA" className="h-9" />
                </div>
              </div>
            )}
            {form.image_url && (
              <div>
                <Label className="mb-1.5 block">Radiologic Findings (revealed after answering)</Label>
                <Textarea
                  value={form.findings}
                  onChange={e => setForm(f => ({ ...f, findings: e.target.value }))}
                  placeholder="Right lower lobe airspace opacity with air bronchograms..."
                  className="min-h-[70px]"
                />
              </div>
            )}
            <div>
              <Label className="mb-1.5 block">Explanation</Label>
              <Textarea
                value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Why this answer is correct..."
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Concept Tag</Label>
                <Input value={form.concept_tag} onChange={e => setForm(f => ({ ...f, concept_tag: e.target.value }))} placeholder="e.g. Pathophysiology" className="h-9" />
              </div>
              <div>
                <Label className="mb-1.5 block">Exam Relevance</Label>
                <Select value={form.exam_relevance} onValueChange={v => setForm(f => ({ ...f, exam_relevance: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-1" />{saving ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {questions.length === 0 && !showEditor ? (
        <p className="text-muted-foreground text-center py-8">No questions for this topic yet.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <Card key={q.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-muted-foreground mt-1">Q{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-2">{q.stem}</p>
                    <div className="space-y-1 mb-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`text-xs px-2 py-1 rounded ${i === q.correct_answer_index ? "bg-green-500/10 text-green-400 font-medium" : "text-muted-foreground"}`}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                      {q.concept_tag && <Badge variant="outline" className="text-[10px]">{q.concept_tag}</Badge>}
                      <Badge variant="outline" className="text-[10px]">Exam: {q.exam_relevance}</Badge>
                    </div>
                  </div>
                  {isInstructor && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(q)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
