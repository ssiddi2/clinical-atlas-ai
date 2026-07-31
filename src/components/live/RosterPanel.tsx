import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hand, Shuffle, Users } from "lucide-react";
import type { Participant } from "@/hooks/useClassroomPresence";

interface Props {
  participants: Participant[];
  canManage: boolean;
  onCallOn?: (p: Participant) => void;
}

const mins = (s: number) => `${Math.round(s / 60)}m`;

/** Live roster: who's in the room, who has a hand up, and how long they've attended. */
export default function RosterPanel({ participants, canManage, onCallOn }: Props) {
  const sorted = useMemo(
    () =>
      [...participants].sort((a, b) => {
        if (!!a.hand_raised_at !== !!b.hand_raised_at) return a.hand_raised_at ? -1 : 1;
        if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [participants],
  );

  const online = sorted.filter((p) => p.is_online).length;
  const hands = sorted.filter((p) => p.hand_raised_at);

  const coldCall = () => {
    const pool = hands.length ? hands : sorted.filter((p) => p.is_online);
    if (!pool.length) return;
    const fewest = Math.min(...pool.map((p) => p.called_on_count));
    const candidates = pool.filter((p) => p.called_on_count === fewest);
    onCallOn?.(candidates[Math.floor(Math.random() * candidates.length)]);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 text-primary" /> In the room
          <Badge variant="secondary">{online}/{sorted.length}</Badge>
        </div>
        {canManage && (
          <Button size="sm" variant="outline" onClick={coldCall} disabled={!sorted.length}>
            <Shuffle className="mr-1 h-3.5 w-3.5" /> {hands.length ? "Next hand" : "Cold call"}
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {sorted.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No one has joined yet.</p>}
        {sorted.map((p) => (
          <div
            key={p.user_id}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${p.hand_raised_at ? "border-amber-300 bg-amber-50" : "border-border/60 bg-card"}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${p.is_online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
            <Avatar className="h-7 w-7">
              <AvatarImage src={p.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="text-[10px]">{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p.name}</span>
            {p.hand_raised_at && <Hand className="h-4 w-4 shrink-0 text-amber-600" />}
            <span className="shrink-0 text-[11px] text-muted-foreground">{mins(p.accumulated_seconds)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}