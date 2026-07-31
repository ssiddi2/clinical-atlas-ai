import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StageMode = "video" | "whiteboard" | "diagram" | "case";

export interface StageState {
  mode: StageMode;
  payload: Record<string, any>;
}

/** Shared "what the class is looking at" state, synced in realtime. */
export function useLiveStage(classroomId: string) {
  const [stage, setStage] = useState<StageState>({ mode: "video", payload: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classroomId) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("classroom_stage")
        .select("mode, payload")
        .eq("classroom_id", classroomId)
        .maybeSingle();
      if (!active) return;
      if (data) setStage({ mode: data.mode as StageMode, payload: (data.payload as any) || {} });
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`stage_${classroomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classroom_stage", filter: `classroom_id=eq.${classroomId}` },
        (msg) => {
          const row = msg.new as any;
          if (row) setStage({ mode: row.mode, payload: row.payload || {} });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [classroomId]);

  const pushStage = useCallback(
    async (mode: StageMode, payload: Record<string, any> = {}) => {
      setStage({ mode, payload });
      await supabase.from("classroom_stage").upsert(
        { classroom_id: classroomId, mode, payload, updated_at: new Date().toISOString() },
        { onConflict: "classroom_id" },
      );
    },
    [classroomId],
  );

  return { stage, loading, pushStage };
}