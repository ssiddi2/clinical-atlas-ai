import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, HelpCircle, Turtle, Activity } from "lucide-react";

interface Props {
  classroomId: string;
  /** Window in seconds for "recent" reactions. Default 60. */
  windowSeconds?: number;
}

const REACTIONS = [
  { key: "got_it", label: "Got it", icon: ThumbsUp, color: "text-emerald-400", bar: "bg-emerald-400" },
  { key: "confused", label: "Confused", icon: HelpCircle, color: "text-amber-400", bar: "bg-amber-400" },
  { key: "slow_down", label: "Slow down", icon: Turtle, color: "text-sky-400", bar: "bg-sky-400" },
] as const;

export default function ReactionMeter({ classroomId, windowSeconds = 60 }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({ got_it: 0, confused: 0, slow_down: 0 });

  const refresh = async () => {
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
    const { data } = await supabase
      .from("live_reactions")
      .select("reaction")
      .eq("classroom_id", classroomId)
      .gte("created_at", since);
    const c: Record<string, number> = { got_it: 0, confused: 0, slow_down: 0 };
    (data || []).forEach((r: any) => { c[r.reaction] = (c[r.reaction] || 0) + 1; });
    setCounts(c);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel(`reactions_${classroomId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "live_reactions", filter: `classroom_id=eq.${classroomId}` },
        () => refresh()
      )
      .subscribe();
    const interval = setInterval(refresh, 15_000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  const total = counts.got_it + counts.confused + counts.slow_down;

  return (
    <Card className="bg-card/50 border-border/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Class pulse</span>
          </div>
          <span className="text-xs text-muted-foreground">last {windowSeconds}s · {total}</span>
        </div>
        <div className="space-y-2">
          {REACTIONS.map(r => {
            const Icon = r.icon;
            const count = counts[r.key] || 0;
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={r.key} className="flex items-center gap-2 text-xs">
                <Icon className={`h-3.5 w-3.5 ${r.color} shrink-0`} />
                <span className="text-foreground/80 w-20 shrink-0">{r.label}</span>
                <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div className={`h-full ${r.bar} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-muted-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
