import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bookmark, BookmarkCheck, ChevronRight, Clock, FolderPlus, MessageSquare,
  NotebookPen, Share2, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import type { CardState, PredictiveCard } from "./types";
import type { CardGroup } from "./useCardGroups";

interface Props {
  card: PredictiveCard;
  state?: CardState;
  groups: CardGroup[];
  onAsk: (card: PredictiveCard) => void;
  onStudyGuide: (card: PredictiveCard) => void;
  onDrill: (card: PredictiveCard) => void;
  onOpenJourney: (card: PredictiveCard) => void;
  onBookmark: (card: PredictiveCard) => void;
  onSnooze: (card: PredictiveCard) => void;
  onGroup: (card: PredictiveCard, group: CardGroup | null) => void;
}

/** A single predictive tile: swipe left to snooze, tap through, or hand off to ATLAS. */
const PredictiveCardItem = ({
  card, state, groups, onAsk, onStudyGuide, onDrill, onOpenJourney, onBookmark, onSnooze, onGroup,
}: Props) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-220, -60, 0], [0, 1, 1]);
  const Icon = card.icon;
  const activeGroup = groups.find((g) => g.id === state?.group_id);

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

  const openPrimary = () => {
    if (card.journey) onOpenJourney(card);
    else if (card.href) navigate(card.href);
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
        <button
          onClick={openPrimary}
          className="min-w-0 flex-1 text-left"
          aria-label={`Open ${card.title}`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {card.eyebrow}
          </p>
          <h3 className="font-semibold leading-snug mt-0.5 break-words flex items-center gap-1">
            <span className="break-words">{card.title}</span>
            {card.journey && (
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            )}
          </h3>
          {card.body && <p className="text-sm text-muted-foreground mt-1">{card.body}</p>}
          {activeGroup && <Badge variant="secondary" className="mt-2">{activeGroup.name}</Badge>}
        </button>
        <button
          onClick={() => onBookmark(card)}
          aria-label={state?.bookmarked ? "Remove bookmark" : "Bookmark card"}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {state?.bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      {card.imageUrl && (
        <button
          onClick={openPrimary}
          className="mt-3 block w-full overflow-hidden rounded-xl border border-border bg-muted"
          aria-label={`Open ${card.title}`}
        >
          <img
            src={card.imageUrl}
            alt={card.title}
            loading="lazy"
            className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
          />
        </button>
      )}



      <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
        <Button size="sm" className="rounded-full h-8" onClick={openPrimary}>
          {card.ctaLabel || "Open"}
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={() => onAsk(card)}>
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Ask ATLAS
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={() => onStudyGuide(card)}>
          <NotebookPen className="h-3.5 w-3.5 mr-1.5" /> Study guide
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={() => onDrill(card)}>
          <Target className="h-3.5 w-3.5 mr-1.5" /> Questions
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-8 text-muted-foreground"
              aria-label="Add card to a group"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Add to group</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {groups.length === 0 && (
              <DropdownMenuItem disabled>Create a group first</DropdownMenuItem>
            )}
            {groups.map((g) => (
              <DropdownMenuItem key={g.id} onClick={() => onGroup(card, g)}>
                {g.name}{state?.group_id === g.id ? " ✓" : ""}
              </DropdownMenuItem>
            ))}
            {state?.group_id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onGroup(card, null)}>Remove from group</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
