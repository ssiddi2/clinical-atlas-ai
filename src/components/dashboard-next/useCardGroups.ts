import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CardGroup {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

/** Named collections a student files dashboard cards into. */
export function useCardGroups(userId: string | null | undefined) {
  const [groups, setGroups] = useState<CardGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("card_groups")
      .select("id, name, color, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setGroups(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const createGroup = useCallback(async (name: string) => {
    if (!userId || !name.trim()) return null;
    const { data, error } = await supabase
      .from("card_groups")
      .insert({ user_id: userId, name: name.trim(), sort_order: groups.length })
      .select("id, name, color, sort_order")
      .single();
    if (error) {
      toast({
        title: "Could not create group",
        description: error.code === "23505" ? "You already have a group with that name." : error.message,
        variant: "destructive",
      });
      return null;
    }
    setGroups((prev) => [...prev, data]);
    return data;
  }, [userId, groups.length]);

  const removeGroup = useCallback(async (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    await supabase.from("card_groups").delete().eq("id", id);
  }, []);

  return { groups, loading, createGroup, removeGroup, reload: load };
}
