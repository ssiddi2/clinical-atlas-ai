import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Layers, MessageSquare, NotebookPen, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { findScene } from "@/components/live/diagramLibrary";
import type { PredictiveCard } from "./types";

interface Props {
  card: PredictiveCard | null;
  onClose: () => void;
  onAskAtlas: (card: PredictiveCard, prompt: string) => void;
  onStudyGuide: (card: PredictiveCard) => void;
  onDrill: (card: PredictiveCard) => void;
}

/**
 * Journey: mechanism diagram → step through each frame → ask ATLAS about the
 * frame you're on → guide or questions once you've reached the end.
 */
const DiagramJourneySheet = ({ card, onClose, onAskAtlas, onStudyGuide, onDrill }: Props) => {
  const scene = findScene(card?.sceneId);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [card?.key]);

  if (!card || !scene) return null;

  const step = scene.steps[Math.min(index, scene.steps.length - 1)];
  const atEnd = index >= scene.steps.length - 1;
  // Every frame up to the current one is drawn, so the mechanism builds up.
  const drawn = scene.steps.slice(0, index + 1).map((s) => s.svgElements).join("");

  return (
    <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{card.eyebrow}</Badge>
            <Badge variant="outline">
              Step {index + 1} of {scene.steps.length}
            </Badge>
          </div>
          <SheetTitle className="mt-1 flex items-center gap-2 text-xl">
            <Layers className="h-5 w-5 text-primary" /> {scene.title}
          </SheetTitle>
          <SheetDescription>Build the mechanism one frame at a time.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 pb-10">
          <Progress value={((index + 1) / scene.steps.length) * 100} className="h-1.5" />

          <div className="rounded-2xl border border-border bg-card p-3">
            <motion.svg
              key={index}
              viewBox={scene.viewBox}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mx-auto h-[38vh] w-full"
              role="img"
              aria-label={`${scene.title} — ${step.label}`}
              dangerouslySetInnerHTML={{ __html: drawn }}
            />
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {step.label}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{step.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            {atEnd ? (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Mechanism complete
              </div>
            ) : (
              <Button className="rounded-full" onClick={() => setIndex((i) => i + 1)}>
                Next frame <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() =>
                onAskAtlas(
                  card,
                  `In the mechanism "${scene.title}", explain this step in depth: ${step.label}. ${step.description}`,
                )
              }
            >
              <MessageSquare className="mr-1.5 h-4 w-4" /> Ask about this step
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => onStudyGuide(card)}>
              <NotebookPen className="mr-1.5 h-4 w-4" /> Study guide
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => onDrill(card)}>
              <Target className="mr-1.5 h-4 w-4" /> Questions
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DiagramJourneySheet;
