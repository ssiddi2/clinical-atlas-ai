import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deriveAdaptation, type Adaptation, type LearningProfile } from "@/lib/learningProfile";

// Module-level cache so multiple components don't refetch in the same session.
let cached: { userId: string; profile: LearningProfile | null } | null = null;

export function useLearningProfile() {
  const [profile, setProfile] = useState<LearningProfile | null>(cached?.profile ?? null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      if (cached?.userId === user.id) {
        setProfile(cached.profile);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("learning_profile")
        .eq("user_id", user.id)
        .maybeSingle();
      const p = (data?.learning_profile ?? null) as LearningProfile | null;
      cached = { userId: user.id, profile: p };
      if (active) { setProfile(p); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const adaptation: Adaptation | null = deriveAdaptation(profile);
  return { profile, adaptation, loading };
}