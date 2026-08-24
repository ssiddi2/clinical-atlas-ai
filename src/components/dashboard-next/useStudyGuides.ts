import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { PredictiveCard } from "./types";

export interface StudyGuide {
  id: string;
  title: string;
  subject: string | null;
  focus_areas: string[];
  content: string;
  card_key: string | null;
  card_type: string | null;
  topic_id: string | null;
  created_at: string;
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-study-guide`;

/** Generates and stores ATLAS study guides, and lists the student's saved ones. */
export function useStudyGuides(userId: string | null | undefined) {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("study_guides")
      .select("id, title, subject, focus_areas, content, card_key, card_type, topic_id, created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    setGuides((data as StudyGuide[]) ?? []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const generate = useCallback(async (card: PredictiveCard, promptOverride?: string): Promise<StudyGuide | null> => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in", variant: "destructive" });
        return null;
      }
      const resp = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          prompt: promptOverride ?? card.studyGuidePrompt,
          context: card.atlasContext,
          cardKey: card.key,
          cardType: card.type,
          topicId: card.topicId ?? null,
        }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast({
          title: "Study guide unavailable",
          description: payload.error ?? "ATLAS could not build the guide right now.",
          variant: "destructive",
        });
        return null;
      }
      const guide = payload.guide as StudyGuide;
      setGuides((prev) => [guide, ...prev]);
      return guide;
    } finally {
      setGenerating(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setGuides((prev) => prev.filter((g) => g.id !== id));
    await supabase.from("study_guides").delete().eq("id", id);
  }, []);

  return { guides, generating, generate, remove, reload: load };
}
