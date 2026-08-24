import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bookmark, BookmarkCheck, Clock, MessageSquare, NotebookPen, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { CardState, PredictiveCard } from "./types";

interface Props {
  card: PredictiveCard;
  state?: CardState;
  onAsk: (card: PredictiveCard) => void;
  onStudyGuide: (card: PredictiveCard) => void;
  onBookmark: (card: PredictiveCard) => void;
  onSnooze: (card: PredictiveCard) => void;
}

/** A single predictive tile: swipe left to snooze, tap through, or hand off to ATLAS. */
const PredictiveCardItem = ({ card, state, onAsk, onStudyGuide, onBookmark, onSnooze }: Props) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-220, -60, 0], [0, 1, 1]);
  const Icon = card.icon;

  const share = async () => {
    const url = card.href ? `${window.location.origin}${card.href}` : window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: card.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: card.title });
      }
    } catch { /* user cancelled */ }
  };

  return (
    <motion.article
      layout
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      onDragEnd={(_, info) => {
        if (info.offset.x < -140) onSnooze(card);
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="group rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl ${card.tone} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {card.eyebrow}
          </p>
          <h3 className="font-semibold leading-snug mt-0.5 break-words">{card.title}</h3>
          {card.body && <p className="text-sm text-muted-foreground mt-1">{card.body}</p>}
        </div>
        <button
          onClick={() => onBookmark(card)}
          aria-label={state?.bookmarked ? "Remove bookmark" : "Bookmark card"}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {state?.bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
        {card.href && (
          <Button size="sm" className="rounded-full h-8" onClick={() => navigate(card.href!)}>
            {card.ctaLabel || "Open"}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={() => onAsk(card)}>
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Ask ATLAS
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={() => onStudyGuide(card)}>
          <NotebookPen className="h-3.5 w-3.5 mr-1.5" /> Study guide
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-8 text-muted-foreground"
          onClick={() => onSnooze(card)}
          aria-label="Snooze card"
        >
          <Clock className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-8 text-muted-foreground"
          onClick={share}
          aria-label="Share card"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.article>
  );
};

export default PredictiveCardItem;
