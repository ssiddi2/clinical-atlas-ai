import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "lm-dashboard-next-split";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

/** Desktop two-pane layout with a draggable divider; persists the ratio locally. */
const SplitPane = ({ left, right }: SplitPaneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return stored >= 25 && stored <= 75 ? stored : 55;
  });
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
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      document.body.style.userSelect = "";
    };
  }, [dragging, apply]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(Math.round(ratio)));
  }, [ratio]);

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1">
      <div className="min-w-0 overflow-hidden" style={{ width: `${ratio}%` }}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
        tabIndex={0}
        onMouseDown={() => setDragging(true)}
        onDoubleClick={() => setRatio(55)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setRatio((r) => Math.max(25, r - 2));
          if (e.key === "ArrowRight") setRatio((r) => Math.min(75, r + 2));
        }}
        className={`relative w-1.5 flex-shrink-0 cursor-col-resize bg-border/60 hover:bg-primary/40 transition-colors ${
          dragging ? "bg-primary/60" : ""
        }`}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-foreground/20" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">{right}</div>
    </div>
  );
};

export default SplitPane;
