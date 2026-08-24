import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ArtifactDraft } from "./AtlasChat";

export interface AtlasArtifact {
  id: string;
  kind: "image" | "link" | "note";
  title: string;
  caption: string | null;
  image_url: string | null;
  source_url: string | null;
  credit: string | null;
  license: string | null;
  source_query: string | null;
  context_excerpt: string | null;
  topic_tags: string[];
  faculty_verified: boolean;
  pinned: boolean;
  session_count: number;
  last_studied_at: string | null;
  created_at: string;
}

const COLUMNS =
  "id, kind, title, caption, image_url, source_url, credit, license, source_query, context_excerpt, topic_tags, faculty_verified, pinned, session_count, last_studied_at, created_at";

/**
 * The student's ATLAS artifact library: teaching images and cited pages they
 * kept from a conversation, each of which can seed a focused learning session.
 */
export function useArtifacts(userId: string | null | undefined) {
  const [artifacts, setArtifacts] = useState<AtlasArtifact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setArtifacts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("atlas_artifacts")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(120);
    if (error) console.error("Could not load artifacts:", error.message);
    setArtifacts((data as AtlasArtifact[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Keeps an artifact from a chat answer. Duplicates are silently ignored. */
  const save = useCallback(
    async (
      draft: ArtifactDraft & {
        conversationId?: string | null;
        sourceQuery?: string | null;
        contextExcerpt?: string | null;
        facultyVerified?: boolean;
      },
    ): Promise<boolean> => {
      if (!userId) {
        toast({ title: "Please sign in to keep this", variant: "destructive" });
        return false;
      }
      const { data, error } = await supabase
        .from("atlas_artifacts")
        .insert({
          user_id: userId,
          conversation_id: draft.conversationId ?? null,
          kind: draft.kind,
          title: draft.title,
          caption: draft.caption ?? null,
          image_url: draft.imageUrl ?? null,
          source_url: draft.sourceUrl ?? null,
          source_query: draft.sourceQuery ?? null,
          context_excerpt: draft.contextExcerpt ?? null,
          faculty_verified: draft.facultyVerified ?? false,
        })
        .select(COLUMNS)
        .maybeSingle();

      if (error) {
        // Unique index on (user, asset) — already in the library.
        if (error.code === "23505" || error.message.includes("duplicate key")) {
          toast({ title: "Already in your artifacts" });
          return true;
        }
        toast({ title: "Could not keep this", description: error.message, variant: "destructive" });
        return false;
      }
      if (data) setArtifacts((prev) => [data as AtlasArtifact, ...prev]);
      toast({ title: "Kept", description: "Saved to your artifacts — turn it into a session anytime." });
      return true;
    },
    [userId],
  );

  const togglePin = useCallback(async (artifact: AtlasArtifact) => {
    setArtifacts((prev) =>
      prev.map((a) => (a.id === artifact.id ? { ...a, pinned: !a.pinned } : a)),
    );
    await supabase.from("atlas_artifacts").update({ pinned: !artifact.pinned }).eq("id", artifact.id);
  }, []);

  const remove = useCallback(async (id: string) => {
    setArtifacts((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("atlas_artifacts").delete().eq("id", id);
  }, []);

  /** Records that a focused session was started from this artifact. */
  const markStudied = useCallback(async (artifact: AtlasArtifact) => {
    const next = {
      session_count: (artifact.session_count ?? 0) + 1,
      last_studied_at: new Date().toISOString(),
    };
    setArtifacts((prev) => prev.map((a) => (a.id === artifact.id ? { ...a, ...next } : a)));
    await supabase.from("atlas_artifacts").update(next).eq("id", artifact.id);
  }, []);

  return { artifacts, loading, save, togglePin, remove, markStudied, reload: load };
}
