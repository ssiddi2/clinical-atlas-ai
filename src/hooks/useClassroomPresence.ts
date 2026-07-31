import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Participant {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_online: boolean;
  hand_raised_at: string | null;
  accumulated_seconds: number;
  called_on_count: number;
  last_seen_at: string;
}

const HEARTBEAT_MS = 20_000;

/** Tracks who is actually in the room and accumulates attendance time. */
export function useClassroomPresence(classroomId: string, userId?: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const refresh = useCallback(async () => {
    if (!classroomId) return;
    const { data: rows } = await supabase
      .from("classroom_presence")
      .select("user_id, is_online, hand_raised_at, accumulated_seconds, called_on_count, last_seen_at")
      .eq("classroom_id", classroomId);
    if (!rows?.length) return setParticipants([]);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, avatar_url")
      .in("user_id", rows.map((r) => r.user_id));

    const byId = new Map((profiles || []).map((p) => [p.user_id, p]));
    const stale = Date.now() - HEARTBEAT_MS * 3;
    setParticipants(
      rows.map((r) => {
        const p = byId.get(r.user_id);
        return {
          user_id: r.user_id,
          name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Student",
          avatar_url: p?.avatar_url ?? null,
          is_online: r.is_online && new Date(r.last_seen_at).getTime() > stale,
          hand_raised_at: r.hand_raised_at,
          accumulated_seconds: r.accumulated_seconds,
          called_on_count: r.called_on_count,
          last_seen_at: r.last_seen_at,
        };
      }),
    );
  }, [classroomId]);

  // Heartbeat: keep own row fresh and accumulate attended time.
  useEffect(() => {
    if (!classroomId || !userId) return;
    let cancelled = false;

    const beat = async (seconds: number) => {
      if (cancelled) return;
      const { data: existing } = await supabase
        .from("classroom_presence")
        .select("accumulated_seconds")
        .eq("classroom_id", classroomId)
        .eq("user_id", userId)
        .maybeSingle();
      await supabase.from("classroom_presence").upsert(
        {
          classroom_id: classroomId,
          user_id: userId,
          is_online: true,
          last_seen_at: new Date().toISOString(),
          accumulated_seconds: (existing?.accumulated_seconds ?? 0) + seconds,
        },
        { onConflict: "classroom_id,user_id" },
      );
    };

    beat(0);
    const interval = setInterval(() => beat(HEARTBEAT_MS / 1000), HEARTBEAT_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase
        .from("classroom_presence")
        .update({ is_online: false, last_seen_at: new Date().toISOString() })
        .eq("classroom_id", classroomId)
        .eq("user_id", userId)
        .then(() => {});
    };
  }, [classroomId, userId]);

  // Realtime roster
  useEffect(() => {
    if (!classroomId) return;
    refresh();
    const channel = supabase
      .channel(`presence_${classroomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classroom_presence", filter: `classroom_id=eq.${classroomId}` },
        () => refresh(),
      )
      .subscribe();
    const interval = setInterval(refresh, 30_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [classroomId, refresh]);

  const setHand = useCallback(
    async (raised: boolean) => {
      if (!userId) return;
      await supabase
        .from("classroom_presence")
        .update({ hand_raised_at: raised ? new Date().toISOString() : null })
        .eq("classroom_id", classroomId)
        .eq("user_id", userId);
      refresh();
    },
    [classroomId, userId, refresh],
  );

  return { participants, refresh, setHand };
}