import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  topicId: string;
}

export default function LearningUnitSettings({ topicId }: Props) {
  const { toast } = useToast();
  const [contentId, setContentId] = useState<string | null>(null);
  const [passingScore, setPassingScore] = useState(70);
  const [requireQuiz, setRequireQuiz] = useState(false);
  const [allowRetry, setAllowRetry] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("learning_unit_content")
        .select("id, passing_score, require_quiz_before_next, allow_retry")
        .eq("topic_id", topicId)
        .maybeSingle();
      if (data) {
        setContentId(data.id);
        setPassingScore(data.passing_score || 70);
        setRequireQuiz(data.require_quiz_before_next || false);
        setAllowRetry(data.allow_retry !== false);
      }
      setLoading(false);
    };
    load();
  }, [topicId]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      topic_id: topicId,
      passing_score: passingScore,
      require_quiz_before_next: requireQuiz,
      allow_retry: allowRetry,
    };

    let error;
    if (contentId) {
      ({ error } = await supabase.from("learning_unit_content").update(payload).eq("id", contentId));
    } else {
      const { data, error: e } = await supabase.from("learning_unit_content").insert(payload).select().single();
      error = e;
      if (data) setContentId(data.id);
    }

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Learning Flow Control</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="mb-1.5 block">Passing Score (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={e => setPassingScore(Number(e.target.value))}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">Students must score at least this to pass</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Quiz Before Next Topic</Label>
              <p className="text-xs text-muted-foreground">Lock next topic until student passes this quiz</p>
            </div>
            <Switch checked={requireQuiz} onCheckedChange={setRequireQuiz} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Retry on Failure</Label>
              <p className="text-xs text-muted-foreground">Let students retake the quiz if they fail</p>
            </div>
            <Switch checked={allowRetry} onCheckedChange={setAllowRetry} />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1" />{saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
