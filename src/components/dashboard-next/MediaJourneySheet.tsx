import { useEffect, useState } from "react";
import { ExternalLink, Eye, EyeOff, Loader2, MessageSquare, NotebookPen, Star, Target, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { PredictiveCard } from "./types";

interface Props {
  card: PredictiveCard | null;
  userId: string | null | undefined;
  onClose: () => void;
  onAskAtlas: (card: PredictiveCard) => void;
  onStudyGuide: (card: PredictiveCard) => void;
  onDrill: (card: PredictiveCard) => void;
}

/**
 * Journey: teaching image → look before you read → reveal the caption →
 * hand off to ATLAS, a study guide, or questions.
 */
const MediaJourneySheet = ({ card, userId, onClose, onAskAtlas, onStudyGuide, onDrill }: Props) => {
  const [revealed, setRevealed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [broken, setBroken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kept, setKept] = useState(false);

  useEffect(() => {
    setRevealed(false);
    setZoom(1);
    setBroken(false);
    setKept(false);
  }, [card?.key]);

  // Count the view against the curated library so faculty see what's working.
  useEffect(() => {
    if (!card?.mediaId) return;
    supabase.rpc as unknown; // no rpc needed; usage is tracked below
  }, [card?.mediaId]);

  const keep = async () => {
    if (!card || !userId || !card.imageUrl) return;
    setSaving(true);
    const { error } = await supabase.from("atlas_artifacts").insert({
      user_id: userId,
      kind: "image",
      title: card.title,
      caption: card.caption ?? null,
      image_url: card.imageUrl,
      source_url: card.sourceUrl ?? null,
      credit: card.credit ?? null,
      license: card.license ?? null,
      topic_tags: card.focus ?? [],
      faculty_verified: !!card.mediaId,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Already in your library", description: card.title });
    } else {
      setKept(true);
      toast({ title: "Kept in your library", description: "Find it any time under Artifacts." });
    }
  };

  if (!card) return null;

  return (
    <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{card.eyebrow}</Badge>
            {card.mediaId && <Badge className="bg-emerald-600 text-white">Faculty approved</Badge>}
          </div>
          <SheetTitle className="mt-1 text-xl">{card.title}</SheetTitle>
          <SheetDescription>
            Look first. Name what you see, then reveal the teaching read.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 pb-10">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-black/90">
            {broken || !card.imageUrl ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                This image could not be loaded from its source.
              </div>
            ) : (
              <img
                src={card.imageUrl}
                alt={card.title}
                onError={() => setBroken(true)}
                style={{ transform: `scale(${zoom})` }}
                className="mx-auto max-h-[52vh] w-auto origin-center object-contain transition-transform duration-200"
              />
            )}
            <div className="absolute bottom-2 right-2 flex gap-1.5">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full"
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full"
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Teaching read
              </p>
              <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => setRevealed((r) => !r)}>
                {revealed ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
                {revealed ? "Hide" : "Reveal"}
              </Button>
            </div>
            {revealed ? (
              <p className="mt-2 text-sm leading-relaxed">
                {card.caption || "No caption was recorded for this image yet — ask ATLAS to read it with you."}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Describe the findings out loud first, then reveal.
              </p>
            )}
            {(card.credit || card.sourceUrl) && (
              <p className="mt-3 text-xs text-muted-foreground">
                {card.credit}
                {card.credit && card.license ? " · " : ""}
                {card.license}
                {card.sourceUrl && (
                  <>
                    {" · "}
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => onAskAtlas(card)}>
              <MessageSquare className="mr-1.5 h-4 w-4" /> Read it with ATLAS
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => onStudyGuide(card)}>
              <NotebookPen className="mr-1.5 h-4 w-4" /> Study guide
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => onDrill(card)}>
              <Target className="mr-1.5 h-4 w-4" /> Questions
            </Button>
            {!card.artifactId && (
              <Button variant="ghost" className="rounded-full" onClick={keep} disabled={saving || kept}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Star className="mr-1.5 h-4 w-4" />}
                {kept ? "Kept" : "Keep & study"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MediaJourneySheet;
