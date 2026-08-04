import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export interface SubscriptionState {
  loading: boolean;
  isActive: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  refetch: () => void;
}

const ACTIVE = ["active", "trialing", "past_due"];

export function useSubscription(userId: string | null): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<{
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
  } | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setRow(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setRow(data ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
    if (!userId) return;
    const channel = supabase
      .channel(`subscriptions:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
        () => fetch(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetch]);

  const notExpired = !row?.current_period_end || new Date(row.current_period_end) > new Date();
  const isActive = !!row && notExpired &&
    (ACTIVE.includes(row.status) || row.status === "canceled");

  return {
    loading,
    isActive,
    status: row?.status ?? null,
    currentPeriodEnd: row?.current_period_end ?? null,
    cancelAtPeriodEnd: !!row?.cancel_at_period_end,
    refetch: fetch,
  };
}