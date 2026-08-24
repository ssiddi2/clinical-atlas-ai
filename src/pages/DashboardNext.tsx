import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LayoutDashboard, Loader2, MessageSquare, NotebookPen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import AtlasChat, { AtlasContext, ArtifactCaptureProvider } from "@/components/atlas/AtlasChat";
import { useArtifacts } from "@/components/atlas/useArtifacts";
import { useAtlasChat } from "@/components/atlas/useAtlasChat";
import SplitPane from "@/components/dashboard-next/SplitPane";
import PredictiveCardItem from "@/components/dashboard-next/PredictiveCardItem";
import CardGroupsBar, { CardFilter } from "@/components/dashboard-next/CardGroupsBar";
import DrillSheet, { DrillRequest } from "@/components/dashboard-next/DrillSheet";
import StudyGuideSheet from "@/components/dashboard-next/StudyGuideSheet";
import TopicJourneySheet from "@/components/dashboard-next/TopicJourneySheet";
import LectureJourneySheet from "@/components/dashboard-next/LectureJourneySheet";
import { usePredictiveCards } from "@/components/dashboard-next/usePredictiveCards";
import { useCardGroups, CardGroup } from "@/components/dashboard-next/useCardGroups";
import { useStudyGuides, StudyGuide } from "@/components/dashboard-next/useStudyGuides";
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
  const [filter, setFilter] = useState<CardFilter>({ kind: "all" });
  const [drill, setDrill] = useState<DrillRequest | null>(null);
  const [openGuide, setOpenGuide] = useState<StudyGuide | null>(null);
  const [topicCard, setTopicCard] = useState<PredictiveCard | null>(null);
  const [lectureCard, setLectureCard] = useState<PredictiveCard | null>(null);

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
  const { save: saveArtifact } = useArtifacts(user?.id);
  const { cards, states, loading, updateState, reload } = usePredictiveCards(user?.id);
  const { groups, createGroup, removeGroup } = useCardGroups(user?.id);
  const { guides, generating, generate, remove } = useStudyGuides(user?.id);

  const firstName = user?.user_metadata?.first_name || "there";

  const handoff = (card: PredictiveCard, prompt: string) => {
    setContext({ label: card.title, prompt: card.atlasContext });
    setDraft(prompt);
    if (isMobile) setMobileView("atlas");
  };

  const buildGuide = async (card: PredictiveCard) => {
    const guide = await generate(card);
    if (guide) setOpenGuide(guide);
  };

  const drillCard = (card: PredictiveCard, focus?: string[]) =>
    setDrill({
      title: `Drill · ${card.title}`,
      focus: focus ?? card.focus ?? [card.title],
      subject: card.subject ?? null,
    });

  const openJourney = (card: PredictiveCard) => {
    if (card.journey === "topic") setTopicCard(card);
    else if (card.journey === "lecture") setLectureCard(card);
    else if (card.journey === "drill") drillCard(card);
    else if (card.href) navigate(card.href);
  };

  const snooze = (card: PredictiveCard) => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    updateState(card, { snoozed_until: until });
  };

  const setGroup = (card: PredictiveCard, group: CardGroup | null) =>
    updateState(card, { group_id: group?.id ?? null, group_name: group?.name ?? null });

  const visibleCards = useMemo(() => {
    if (filter.kind === "bookmarked") return cards.filter((c) => states[c.key]?.bookmarked);
    if (filter.kind === "group") return cards.filter((c) => states[c.key]?.group_id === filter.id);
    return cards;
  }, [cards, states, filter]);

  const bookmarkCount = useMemo(
    () => cards.filter((c) => states[c.key]?.bookmarked).length,
    [cards, states],
  );

  const countFor = (groupId: string) =>
    cards.filter((c) => states[c.key]?.group_id === groupId).length;

  const suggestions = useMemo(
    () => cards.slice(0, 4).map((c) => c.askPrompt),
    [cards],
  );

  const cardPane = (
    <div className="h-full overflow-y-auto">
      <div className="px-4 md:px-6 py-6 space-y-4 max-w-2xl mx-auto pb-32 md:pb-10">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl font-semibold tracking-tight">{firstName}, here's what matters now</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Surfaced from your courses, lectures and question data. Swipe a card away to snooze it for a day.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full flex-shrink-0"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-1.5" /> Classic
          </Button>
        </header>

        <CardGroupsBar
          groups={groups}
          filter={filter}
          bookmarkCount={bookmarkCount}
          countFor={countFor}
          onFilter={setFilter}
          onCreate={createGroup}
          onRemove={removeGroup}
        />

        {guides.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Your study guides
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guides.slice(0, 6).map((g) => (
                <button
                  key={g.id}
                  onClick={() => setOpenGuide(g)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  <NotebookPen className="h-3 w-3 text-primary" />
                  <span className="max-w-[180px] truncate">{g.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading your signals…
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Sparkles className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">
              {filter.kind === "all" ? "You're all caught up" : "Nothing filed here yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter.kind === "all"
                ? "New cards appear as lectures are scheduled and you work through units."
                : "Save or group a card and it will show up here."}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visibleCards.map((card) => (
              <PredictiveCardItem
                key={card.key}
                card={card}
                state={states[card.key]}
                groups={groups}
                onAsk={(c) => handoff(c, c.askPrompt)}
                onStudyGuide={buildGuide}
                onDrill={(c) => drillCard(c)}
                onOpenJourney={openJourney}
                onBookmark={(c) => updateState(c, { bookmarked: !states[c.key]?.bookmarked })}
                onSnooze={snooze}
                onGroup={setGroup}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const atlasPane = (
    <ArtifactCaptureProvider onSave={(draft) => saveArtifact(draft)}>
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
    </ArtifactCaptureProvider>
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

      <StudyGuideSheet
        guide={openGuide}
        generating={generating}
        onClose={() => setOpenGuide(null)}
        onDrill={(g) =>
          setDrill({
            title: `Drill · ${g.title}`,
            focus: g.focus_areas ?? [],
            subject: g.subject,
            guideId: g.id,
          })
        }
        onAskAtlas={(g) => {
          setContext({ label: g.title, prompt: `The student is studying the guide "${g.title}".` });
          setDraft(`Quiz me on the key points of ${g.title}.`);
          setOpenGuide(null);
          if (isMobile) setMobileView("atlas");
        }}
        onDelete={(g) => remove(g.id)}
      />

      <TopicJourneySheet
        card={topicCard}
        userId={user?.id}
        onClose={() => { setTopicCard(null); reload(); }}
        onAskAtlas={(c) => { setTopicCard(null); handoff(c, c.askPrompt); }}
        onStudyGuide={(c) => { setTopicCard(null); buildGuide(c); }}
        onDrill={(c) => { setTopicCard(null); drillCard(c); }}
      />

      <LectureJourneySheet
        card={lectureCard}
        userId={user?.id}
        onClose={() => setLectureCard(null)}
        onAskAtlas={(c) => { setLectureCard(null); handoff(c, c.askPrompt); }}
        onDrill={(c, focus) => { setLectureCard(null); drillCard(c, focus); }}
      />

      <DrillSheet
        request={drill}
        userId={user?.id}
        onClose={() => setDrill(null)}
        onFinished={reload}
      />
    </div>
  );
};

export default DashboardNext;
