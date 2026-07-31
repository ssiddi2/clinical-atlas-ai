import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eraser, Undo2, Pencil } from "lucide-react";

export interface Stroke {
  points: [number, number][]; // normalized 0..1
  color: string;
  width: number;
}

const COLORS = ["#0077C8", "#1A1A1A", "#DC2626", "#059669", "#D97706"];

interface Props {
  classroomId: string;
  canDraw: boolean;
  /** Optional image drawn behind the strokes (e.g. an ECG or x-ray to mark up). */
  backgroundUrl?: string | null;
}

/** Realtime shared whiteboard. Instructor draws, everyone watches live. */
export default function Whiteboard({ classroomId, canDraw, backgroundUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<Stroke | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    if (bgRef.current?.complete) {
      const img = bgRef.current;
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const all = drawingRef.current ? [...strokesRef.current, drawingRef.current] : strokesRef.current;
    all.forEach((s) => {
      if (s.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      s.points.forEach(([x, y], i) => {
        const px = x * w, py = y * h;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
  }, []);

  // Size canvas to its container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => {
    if (!backgroundUrl) { bgRef.current = null; redraw(); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { bgRef.current = img; redraw(); };
    img.src = backgroundUrl;
  }, [backgroundUrl, redraw]);

  // Load snapshot + subscribe to live strokes
  useEffect(() => {
    if (!classroomId) return;
    let active = true;

    supabase
      .from("whiteboard_snapshots")
      .select("strokes")
      .eq("classroom_id", classroomId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        strokesRef.current = ((data?.strokes as any) || []) as Stroke[];
        redraw();
      });

    const channel = supabase
      .channel(`whiteboard_${classroomId}`)
      .on("broadcast", { event: "stroke" }, ({ payload }) => {
        strokesRef.current = [...strokesRef.current, payload as Stroke];
        redraw();
      })
      .on("broadcast", { event: "clear" }, () => {
        strokesRef.current = [];
        redraw();
      })
      .on("broadcast", { event: "undo" }, () => {
        strokesRef.current = strokesRef.current.slice(0, -1);
        redraw();
      })
      .subscribe();
    channelRef.current = channel;

    return () => { active = false; supabase.removeChannel(channel); channelRef.current = null; };
  }, [classroomId, redraw]);

  const persist = useCallback(async () => {
    await supabase.from("whiteboard_snapshots").upsert(
      {
        classroom_id: classroomId,
        strokes: strokesRef.current as any,
        background_url: backgroundUrl ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "classroom_id" },
    );
  }, [classroomId, backgroundUrl]);

  const pos = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
  };

  const onDown = (e: React.PointerEvent) => {
    if (!canDraw) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drawingRef.current = { points: [pos(e)], color, width };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!canDraw || !drawingRef.current) return;
    drawingRef.current.points.push(pos(e));
    redraw();
  };
  const onUp = () => {
    const stroke = drawingRef.current;
    drawingRef.current = null;
    if (!stroke || stroke.points.length < 2) return;
    strokesRef.current = [...strokesRef.current, stroke];
    redraw();
    channelRef.current?.send({ type: "broadcast", event: "stroke", payload: stroke });
    persist();
  };

  const broadcast = (event: "clear" | "undo") => {
    strokesRef.current = event === "clear" ? [] : strokesRef.current.slice(0, -1);
    redraw();
    channelRef.current?.send({ type: "broadcast", event, payload: {} });
    persist();
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {canDraw && (
        <div className="flex flex-wrap items-center gap-2">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          {COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Pen colour ${c}`}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="range" min={1} max={12} value={width} aria-label="Pen width"
            onChange={(e) => setWidth(Number(e.target.value))}
            className="ml-2 w-24 accent-primary"
          />
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => broadcast("undo")}>
              <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
            </Button>
            <Button size="sm" variant="outline" onClick={() => broadcast("clear")}>
              <Eraser className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className={`w-full flex-1 rounded-2xl border border-border bg-white ${canDraw ? "cursor-crosshair touch-none" : ""}`}
      />
    </div>
  );
}