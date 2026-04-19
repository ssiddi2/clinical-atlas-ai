import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, HelpCircle, Turtle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  classroomId: string;
  studentId: string;
}

const REACTIONS = [
  { key: "got_it", label: "Got it", icon: ThumbsUp, color: "text-emerald-400" },
  { key: "confused", label: "Confused", icon: HelpCircle, color: "text-amber-400" },
  { key: "slow_down", label: "Slow down", icon: Turtle, color: "text-sky-400" },
] as const;

export default function ReactionPanel({ classroomId, studentId }: Props) {
  const { toast } = useToast();
  const [sending, setSending] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const send = async (reaction: string) => {
    setSending(reaction);
    const { error } = await supabase.from("live_reactions").insert({
      classroom_id: classroomId,
      student_id: studentId,
      reaction,
    });
    setSending(null);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
      return;
    }
    setLastSent(reaction);
    setTimeout(() => setLastSent(null), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      {REACTIONS.map(r => {
        const Icon = r.icon;
        const active = lastSent === r.key;
        return (
          <Button
            key={r.key}
            size="sm"
            variant="outline"
            disabled={sending !== null}
            onClick={() => send(r.key)}
            className={`gap-1.5 transition-all ${active ? "scale-110 border-primary" : ""}`}
          >
            <Icon className={`h-4 w-4 ${r.color}`} />
            <span className="text-xs">{r.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
