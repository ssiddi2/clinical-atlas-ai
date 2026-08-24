import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ImageIcon,
  Link2,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useArtifacts, type AtlasArtifact } from "@/components/atlas/useArtifacts";
import { useStudyGuides, type StudyGuide } from "@/components/dashboard-next/useStudyGuides";
import StudyGuideSheet from "@/components/dashboard-next/StudyGuideSheet";
import DrillSheet, { type DrillRequest } from "@/components/dashboard-next/DrillSheet";

/**
 * Artifacts: everything ATLAS showed the student that they chose to keep —
 * teaching images and cited sources — each convertible into a focused learning
 * session (guide → questions) built from that artifact's own context.
 */
const Artifacts = () => {
  const [user, setUser] = useState<User | null>(null);
  const { artifacts, loading, togglePin, remove, markStudied } = useArtifacts(user?.id);
  const { generating, generateFromArtifact } = useStudyGuides(user?.id);
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [drill, setDrill] = useState<DrillRequest | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  const startSession = async (artifact: AtlasArtifact) => {
    setBusyId(artifact.id);
    const built = await generateFromArtifact(artifact);
    setBusyId(null);
    if (built) {
      setGuide(built);
      markStudied(artifact);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your artifacts</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm md:text-base">
              Images and sources you kept from ATLAS. Turn any one of them into a focused session —
              ATLAS builds the guide from that artifact's own clinical context, then drills you on it.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/atlas">
              <Sparkles className="h-4 w-4 mr-1.5" /> Ask ATLAS
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="lm-card mt-8 p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-semibold">Nothing kept yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Ask ATLAS something visual — "show me a chest x-ray of lobar pneumonia" — then tap
              <span className="font-medium"> Keep &amp; study</span> under any image it shows.
            </p>
            <Button asChild className="rounded-full mt-5">
              <Link to="/atlas">Start a conversation</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {artifacts.map((a) => (
              <article key={a.id} className="lm-card overflow-hidden flex flex-col">
                {a.image_url ? (
                  <a href={a.source_url || a.image_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={a.image_url}
                      alt={a.caption || a.title}
                      loading="lazy"
                      className="w-full h-40 object-cover bg-muted"
                    />
                  </a>
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <Link2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{a.title}</h3>
                    <button
                      onClick={() => togglePin(a)}
                      aria-label={a.pinned ? "Unpin artifact" : "Pin artifact"}
                      className="text-muted-foreground hover:text-primary flex-shrink-0"
                    >
                      {a.pinned ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="gap-1">
                      {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                      {a.kind}
                    </Badge>
                    {a.faculty_verified ? (
                      <Badge className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Faculty-verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not yet verified</Badge>
                    )}
                    {a.session_count > 0 && (
                      <Badge variant="outline">{a.session_count} session{a.session_count > 1 ? "s" : ""}</Badge>
                    )}
                  </div>

                  {a.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{a.caption}</p>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={busyId === a.id}
                      onClick={() => startSession(a)}
                    >
                      {busyId === a.id ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Target className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Focused session
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to={`/atlas?artifact=${a.id}`}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Ask
                      </Link>
                    </Button>
                    {(a.source_url || a.image_url) && (
                      <Button asChild size="sm" variant="ghost" className="rounded-full">
                        <a href={a.source_url || a.image_url!} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-muted-foreground"
                      aria-label="Remove artifact"
                      onClick={() => remove(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <StudyGuideSheet
        guide={guide}
        generating={generating}
        onClose={() => setGuide(null)}
        onDrill={(g) => {
          setDrill({ title: g.title, focus: g.focus_areas ?? [], subject: g.subject, guideId: g.id });
          setGuide(null);
        }}
        onAskAtlas={(g) => { window.location.href = `/atlas?guide=${g.id}`; }}
        onDelete={() => setGuide(null)}
      />
      <DrillSheet request={drill} userId={user?.id} onClose={() => setDrill(null)} />
    </AppShell>
  );
};

export default Artifacts;
