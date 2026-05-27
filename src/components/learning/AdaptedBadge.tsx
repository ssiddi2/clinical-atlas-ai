import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLearningProfile } from "@/hooks/useLearningProfile";

interface Props {
  className?: string;
  /** Optional override label (defaults to "Adapted for you") */
  label?: string;
  /** Optional override of the tooltip rationale */
  rationale?: string;
}

/**
 * Small chip shown when content/behaviour has been tailored to the
 * student's learning profile. Renders nothing if no profile exists.
 */
export default function AdaptedBadge({ className, label = "Adapted for you", rationale }: Props) {
  const { adaptation } = useLearningProfile();
  if (!adaptation) return null;
  const reason = rationale ?? adaptation.rationale;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wide",
              className,
            )}
          >
            <Sparkles className="h-3 w-3" />
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          Tailored to your learning profile: {reason}.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}