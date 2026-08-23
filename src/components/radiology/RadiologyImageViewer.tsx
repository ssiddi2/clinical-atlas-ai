import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Maximize2, RotateCcw, Contrast, Sun, Minimize2 } from "lucide-react";

const BUCKET = "radiology-images";

export function useRadiologyImageUrl(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!path) { setUrl(null); return; }
    if (/^https?:\/\//.test(path)) { setUrl(path); return; }
    supabase.storage.from(BUCKET).createSignedUrl(path, 3600).then(({ data }) => {
      if (active) setUrl(data?.signedUrl ?? null);
    });
    return () => { active = false; };
  }, [path]);
  return url;
}

interface Props {
  path?: string | null;
  alt?: string;
  className?: string;
}

export default function RadiologyImageViewer({ path, alt = "Radiology study", className = "" }: Props) {
  const url = useRadiologyImageUrl(path);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); setBrightness(100); setContrast(100); setInvert(false); };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(6, Math.max(1, z - e.deltaY * 0.002)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || zoom === 1) return;
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onPointerUp = () => { drag.current = null; };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    if (fullscreen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  if (!path) return null;

  const stage = (
    <div className="space-y-2">
      <div
        ref={containerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={reset}
        className={`relative overflow-hidden rounded-2xl bg-black touch-none select-none ${fullscreen ? "h-[70vh]" : "aspect-[4/3]"} ${zoom > 1 ? "cursor-grab" : "cursor-zoom-in"}`}
      >
        {!url ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : (
          <img
            src={url}
            alt={alt}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`,
              transition: drag.current ? "none" : "transform 80ms linear",
            }}
          />
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          <Button type="button" size="icon" variant="secondary" className="h-8 w-8 bg-black/60 text-white hover:bg-black/80" onClick={reset} aria-label="Reset view">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="icon" variant="secondary" className="h-8 w-8 bg-black/60 text-white hover:bg-black/80" onClick={() => setFullscreen(f => !f)} aria-label="Toggle fullscreen">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <span className="absolute left-2 bottom-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white/80">
          {Math.round(zoom * 100)}% · scroll to zoom, drag to pan
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Sun className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Slider value={[brightness]} min={40} max={200} step={1} onValueChange={([v]) => setBrightness(v)} />
        </div>
        <div className="flex items-center gap-2">
          <Contrast className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Slider value={[contrast]} min={40} max={220} step={1} onValueChange={([v]) => setContrast(v)} />
          <Button type="button" size="sm" variant={invert ? "default" : "outline"} className="h-7 shrink-0 text-[11px]" onClick={() => setInvert(i => !i)}>
            Invert
          </Button>
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 p-4 sm:p-8 overflow-y-auto">
        <div className="mx-auto max-w-4xl">{stage}</div>
      </div>
    );
  }

  return <div className={className}>{stage}</div>;
}
