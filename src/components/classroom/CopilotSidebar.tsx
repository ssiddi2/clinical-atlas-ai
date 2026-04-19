import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Props {
  classroomId: string;
  studentId: string;
}

interface CopilotQ {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  created_at: string;
}

export default function CopilotSidebar({ classroomId, studentId }: Props) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<CopilotQ[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("lecture_copilot_questions")
      .select("*")
      .eq("classroom_id", classroomId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });
    setQuestions(data || []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`copilot_${classroomId}_${studentId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "lecture_copilot_questions", filter: `student_id=eq.${studentId}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, studentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [questions]);

  const ask = async () => {
    const q = input.trim();
    if (!q || sending) return;
    setSending(true);
    setInput("");
    const { error } = await supabase.functions.invoke("lecture-copilot", {
      body: { classroom_id: classroomId, question: q },
    });
    setSending(false);
    if (error) {
      toast({ title: "ATLAS unavailable", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card className="bg-card/50 border-border/30 flex flex-col h-full">
      <CardContent className="p-4 flex flex-col h-full gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">ATLAS Co-Pilot</span>
          <span className="text-xs text-muted-foreground ml-auto">Private to you</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px] max-h-[400px]">
          {questions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Ask ATLAS anything about this lecture without interrupting. Your questions are private.
            </p>
          )}
          {questions.map(q => (
            <div key={q.id} className="space-y-2">
              <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                <p className="text-xs text-foreground">{q.question}</p>
              </div>
              <div className="rounded-lg bg-card/80 border border-border/30 px-3 py-2">
                {q.status === "pending" ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> ATLAS is thinking…
                  </div>
                ) : q.status === "error" ? (
                  <p className="text-xs text-red-400">Couldn't generate an answer. Try again.</p>
                ) : (
                  <div className="prose prose-xs prose-invert max-w-none text-xs text-foreground/90 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{q.answer || ""}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder="Ask ATLAS quietly…"
            className="min-h-[40px] max-h-[100px] text-xs resize-none"
            rows={1}
          />
          <Button size="sm" onClick={ask} disabled={!input.trim() || sending} className="self-end">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
