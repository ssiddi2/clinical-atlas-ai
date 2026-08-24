import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const STORAGE_KEY = "lm-dashboard-next-split";
const COLLAPSE_KEY = "lm-dashboard-next-atlas-collapsed";
const DEFAULT_RATIO = 55;

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  /** Label for the collapsed rail. */
  rightLabel?: string;
}

/**
 * Desktop two-pane layout with a draggable divider and a collapsible right
 * (ATLAS) pane. Both the ratio and the collapsed state persist locally.
 */
const SplitPane = ({ left, right, rightLabel = "ATLAS" }: SplitPaneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return stored >= 25 && stored <= 75 ? stored : DEFAULT_RATIO;
  });
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");
  const [dragging, setDragging] = useState(false);

  const apply = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setRatio(Math.min(75, Math.max(25, pct)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => apply(e.clientX);
    const touchMove = (e: TouchEvent) => {
      if (e.touches[0]) apply(e.touches[0].clientX);
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", touchMove);
    window.addEventListener("touchend", up);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", up);
      document.body.style.userSelect = "";
    };
  }, [dragging, apply]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(Math.round(ratio)));
  }, [ratio]);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1">
      <div className="min-w-0 overflow-hidden" style={{ width: collapsed ? "100%" : `${ratio}%` }}>
        {left}
      </div>

      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          aria-label={`Expand ${rightLabel} panel`}
          className="group flex w-11 flex-shrink-0 flex-col items-center gap-3 border-l border-border bg-muted/30 py-4 transition-colors hover:bg-muted/60"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          <span className="h-7 w-7 rounded-full gradient-livemed flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span
            className="text-[11px] font-semibold tracking-wide text-muted-foreground"
            style={{ writingMode: "vertical-rl" }}
          >
            {rightLabel}
          </span>
        </button>
      ) : (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panes"
            tabIndex={0}
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
            onDoubleClick={() => setRatio(DEFAULT_RATIO)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setRatio((r) => Math.max(25, r - 2));
              if (e.key === "ArrowRight") setRatio((r) => Math.min(75, r + 2));
            }}
            className={`relative w-1.5 flex-shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40 ${
              dragging ? "bg-primary/60" : ""
            }`}
          >
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-foreground/20" />
            <button
              onClick={() => setCollapsed(true)}
              aria-label={`Collapse ${rightLabel} panel`}
              className="absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-background p-1 text-muted-foreground shadow-sm hover:text-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">{right}</div>
        </>
      )}
    </div>
  );
};

export default SplitPane;
