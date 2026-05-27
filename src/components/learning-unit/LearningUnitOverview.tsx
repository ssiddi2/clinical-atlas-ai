import { useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Star, AlertTriangle, BookOpen, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import AdaptedBadge from "@/components/learning/AdaptedBadge";
import { useLearningProfile } from "@/hooks/useLearningProfile";

interface Props {
  topicId: string;
  courseId: string;
  isInstructor: boolean;
}

interface UnitContent {
  id?: string;
  explanation: string;
  quick_notes: string;
  exam_traps: string;
  instructor_note: string;
  is_high_yield: boolean;
  is_important: boolean;
  is_exam_focus: boolean;
  status: string;
}

const DEFAULT_CONTENT: UnitContent = {
  explanation: "",
  quick_notes: "",
  exam_traps: "",
  instructor_note: "",
  is_high_yield: false,
  is_important: false,
  is_exam_focus: false,
  status: "draft",
};

export default function LearningUnitOverview({ topicId, courseId, isInstructor }: Props) {
  const { toast } = useToast();
  const [content, setContent] = useState<UnitContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { adaptation } = useLearningProfile();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("learning_unit_content")
        .select("*")
        .eq("topic_id", topicId)
        .maybeSingle();
      if (data) setContent(data as any);
      setLoading(false);
    };
    load();
  }, [topicId]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      topic_id: topicId,
      explanation: content.explanation,
      quick_notes: content.quick_notes,
      exam_traps: content.exam_traps,
      instructor_note: content.instructor_note,
      is_high_yield: content.is_high_yield,
      is_important: content.is_important,
      is_exam_focus: content.is_exam_focus,
      status: content.status,
    };

    let error;
    if (content.id) {
      ({ error } = await supabase.from("learning_unit_content").update(payload).eq("id", content.id));
    } else {
      const { data, error: e } = await supabase.from("learning_unit_content").insert(payload).select().single();
      error = e;
      if (data) setContent({ ...content, id: data.id });
    }

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content saved" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  // Student view
  if (!isInstructor) {
    // Build section list, then reorder based on adaptation:
    // - case-first learners (Kolb diverger/accommodator) see Exam Traps (case-style) and Quick Notes before the Explanation
    // - read-dominant learners see Quick Notes first
    // - kinesthetic learners get a nudge toward the Questions tab
    const explanationCard = content.explanation && (
      <Card key="explanation"><CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" />Explanation</CardTitle></CardHeader>
        <CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.explanation}</ReactMarkdown></CardContent>
      </Card>
    );
    const quickNotesCard = content.quick_notes && (
      <Card key="quick" className="border-blue-500/20"><CardHeader><CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4 text-blue-400" />Quick Notes</CardTitle></CardHeader>
        <CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.quick_notes}</ReactMarkdown></CardContent>
      </Card>
    );
    const examTrapsCard = content.exam_traps && (
      <Card key="traps" className="border-red-500/20"><CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" />Exam Traps</CardTitle></CardHeader>
        <CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.exam_traps}</ReactMarkdown></CardContent>
      </Card>
    );
    const instructorCard = content.instructor_note && (
      <Card key="note" className="border-primary/20"><CardHeader><CardTitle className="text-base">Instructor Note</CardTitle></CardHeader>
        <CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.instructor_note}</ReactMarkdown></CardContent>
      </Card>
    );

    let orderedCards: ReactNode[];
    if (adaptation?.caseFirst) {
      orderedCards = [examTrapsCard, quickNotesCard, explanationCard, instructorCard];
    } else if (adaptation?.preferredTab === "quick_notes") {
      orderedCards = [quickNotesCard, explanationCard, examTrapsCard, instructorCard];
    } else {
      orderedCards = [explanationCard, quickNotesCard, examTrapsCard, instructorCard];
    }

    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap items-center">
          {content.is_high_yield && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"><Star className="h-3 w-3 mr-1 fill-yellow-400" />High Yield</Badge>}
          {content.is_important && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Important</Badge>}
          {content.is_exam_focus && <Badge className="bg-red-500/10 text-red-400 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Exam Focus</Badge>}
          <AdaptedBadge />
        </div>
        {adaptation?.preferredTab === "questions" && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            You learn best by doing — jump to the <span className="text-primary font-medium">Questions</span> tab after a quick skim.
          </div>
        )}
        {orderedCards}
        {!content.explanation && !content.quick_notes && !content.exam_traps && (
          <p className="text-muted-foreground text-center py-8">No content published for this unit yet.</p>
        )}
      </div>
    );
  }

  // Instructor editor view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={content.is_high_yield} onCheckedChange={v => setContent(c => ({ ...c, is_high_yield: v }))} />
            <Label className="text-sm">High Yield</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={content.is_important} onCheckedChange={v => setContent(c => ({ ...c, is_important: v }))} />
            <Label className="text-sm">Important</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={content.is_exam_focus} onCheckedChange={v => setContent(c => ({ ...c, is_exam_focus: v }))} />
            <Label className="text-sm">Exam Focus</Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="space-y-4">
          {content.explanation && <Card><CardHeader><CardTitle className="text-base">Explanation</CardTitle></CardHeader><CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.explanation}</ReactMarkdown></CardContent></Card>}
          {content.quick_notes && <Card><CardHeader><CardTitle className="text-base">Quick Notes</CardTitle></CardHeader><CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.quick_notes}</ReactMarkdown></CardContent></Card>}
          {content.exam_traps && <Card><CardHeader><CardTitle className="text-base">Exam Traps</CardTitle></CardHeader><CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.exam_traps}</ReactMarkdown></CardContent></Card>}
          {content.instructor_note && <Card><CardHeader><CardTitle className="text-base">Instructor Note</CardTitle></CardHeader><CardContent className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.instructor_note}</ReactMarkdown></CardContent></Card>}
        </div>
      ) : (
        <div className="grid gap-4">
          <div>
            <Label className="mb-1.5 block">Explanation (Markdown supported)</Label>
            <Textarea
              value={content.explanation}
              onChange={e => setContent(c => ({ ...c, explanation: e.target.value }))}
              placeholder="Write the main explanation for this topic..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Quick Notes</Label>
              <Textarea
                value={content.quick_notes}
                onChange={e => setContent(c => ({ ...c, quick_notes: e.target.value }))}
                placeholder="Short summary / key points..."
                className="min-h-[120px] font-mono text-sm"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Exam Traps</Label>
              <Textarea
                value={content.exam_traps}
                onChange={e => setContent(c => ({ ...c, exam_traps: e.target.value }))}
                placeholder="Common mistakes / tricky scenarios..."
                className="min-h-[120px] font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Instructor Note (visible to students)</Label>
            <Textarea
              value={content.instructor_note}
              onChange={e => setContent(c => ({ ...c, instructor_note: e.target.value }))}
              placeholder="Personal guidance / study tips..."
              className="min-h-[80px] font-mono text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
