import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LayoutDashboard, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import AtlasChat, { AtlasContext } from "@/components/atlas/AtlasChat";
import { useAtlasChat } from "@/components/atlas/useAtlasChat";
import SplitPane from "@/components/dashboard-next/SplitPane";
import PredictiveCardItem from "@/components/dashboard-next/PredictiveCardItem";
import { usePredictiveCards } from "@/components/dashboard-next/usePredictiveCards";
import type { PredictiveCard } from "@/components/dashboard-next/types";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Dashboard Next — ATLAS-first adaptive surface.
 * Mobile: single pane of predictive cards with a floating liquid-glass ATLAS bar.
 * Desktop: draggable split — cards on the left, ATLAS conversation on the right.
 */
const DashboardNext = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState<AtlasContext | null>(null);
  const [mobileView, setMobileView] = useState<"cards" | "atlas">("cards");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const chat = useAtlasChat(user?.id);
  const { cards, states, loading, updateState } = usePredictiveCards(user?.id);

  const firstName = user?.user_metadata?.first_name || "there";

  const handoff = (card: PredictiveCard, prompt: string) => {
    setContext({ label: card.title, prompt: card.atlasContext });
    setDraft(prompt);
    if (isMobile) setMobileView("atlas");
  };

  const snooze = (card: PredictiveCard) => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    updateState(card, { snoozed_until: until });
  };

  const suggestions = useMemo(
    () => cards.slice(0, 4).map((c) => c.askPrompt),
    [cards],
  );

  const cardPane = (
    <div className="h-full overflow-y-auto">
      <div className="px-4 md:px-6 py-6 space-y-4 max-w-2xl mx-auto pb-32 md:pb-10">
        <header>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-semibold tracking-tight">{firstName}, here's what matters now</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Surfaced from your courses, lectures and question data. Swipe a card away to snooze it for a day.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading your signals…
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Sparkles className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">You're all caught up</p>
            <p className="text-sm text-muted-foreground mt-1">
              New cards appear as lectures are scheduled and you work through units.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {cards.map((card) => (
              <PredictiveCardItem
                key={card.key}
                card={card}
                state={states[card.key]}
                onAsk={(c) => handoff(c, c.askPrompt)}
                onStudyGuide={(c) => handoff(c, c.studyGuidePrompt)}
                onBookmark={(c) => updateState(c, { bookmarked: !states[c.key]?.bookmarked })}
                onSnooze={snooze}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const atlasPane = (
    <AtlasChat
      chat={chat}
      draft={draft}
      onDraftChange={setDraft}
      context={context}
      onClearContext={() => setContext(null)}
      composer="glass"
      emptySubtitle="Your AI professor. Tap a card action to bring its context in here."
      suggestions={suggestions}
      className="bg-muted/20"
    />
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppShell headerOnly />

      {isMobile ? (
        <div className="flex-1 min-h-0 relative">
          {mobileView === "cards" ? (
            <>
              {cardPane}
              <div className="fixed inset-x-3 bottom-3 z-30">
                <button
                  onClick={() => setMobileView("atlas")}
                  className="lm-liquid-glass w-full rounded-[28px] px-4 py-3.5 flex items-center gap-3 text-left"
                >
                  <span className="h-8 w-8 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </span>
                  <span className="text-sm text-muted-foreground flex-1 truncate">Ask ATLAS anything…</span>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col min-h-0">
              <div className="px-3 py-2 border-b border-border">
                <Button variant="ghost" size="sm" onClick={() => setMobileView("cards")} className="rounded-full">
                  <LayoutDashboard className="h-4 w-4 mr-1.5" /> Cards
                </Button>
              </div>
              <div className="flex-1 min-h-0">{atlasPane}</div>
            </div>
          )}
        </div>
      ) : (
        <SplitPane left={cardPane} right={atlasPane} />
      )}
    </div>
  );
};

export default DashboardNext;
