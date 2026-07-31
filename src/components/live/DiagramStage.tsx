import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { DIAGRAM_LIBRARY, findScene } from "./diagramLibrary";

interface Props {
  sceneId?: string;
  stepIndex: number;
  canControl: boolean;
  onChange: (sceneId: string, stepIndex: number) => void;
}

/** Step-through clinical animation, synced to every student in the room. */
export default function DiagramStage({ sceneId, stepIndex, canControl, onChange }: Props) {
  const scene = findScene(sceneId);

  if (!scene) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Layers className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {canControl ? "Choose an animation to push to the class." : "Waiting for your instructor to start an animation…"}
        </p>
        {canControl && (
          <div className="grid w-full max-w-xl gap-2">
            {DIAGRAM_LIBRARY.map((s) => (
              <Button key={s.id} variant="outline" className="justify-start" onClick={() => onChange(s.id, 0)}>
                <Layers className="mr-2 h-4 w-4 text-primary" /> {s.title}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const step = Math.min(Math.max(stepIndex, 0), scene.steps.length - 1);
  const current = scene.steps[step];

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-foreground">{scene.title}</h3>
        {canControl && (
          <select
            aria-label="Animation"
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
            value={scene.id}
            onChange={(e) => onChange(e.target.value, 0)}
          >
            {DIAGRAM_LIBRARY.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-white p-4">
        <svg viewBox={scene.viewBox} className="h-full w-full" aria-label={scene.title}>
          {scene.steps.slice(0, step + 1).map((s, idx) => (
            <motion.g
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              dangerouslySetInnerHTML={{ __html: s.svgElements }}
            />
          ))}
        </svg>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {step + 1}
            </span>
            <h4 className="text-sm font-semibold text-foreground">{current.label}</h4>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{current.description}</p>
        </motion.div>
      </AnimatePresence>

      {canControl && (
        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" disabled={step === 0} onClick={() => onChange(scene.id, step - 1)}>
            <ArrowLeft className="mr-1 h-3 w-3" /> Back
          </Button>
          <div className="flex gap-1.5">
            {scene.steps.map((_, i) => (
              <button
                key={i}
                aria-label={`Step ${i + 1}`}
                onClick={() => onChange(scene.id, i)}
                className={`h-2 rounded-full transition-all ${i === step ? "w-4 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
          <Button size="sm" disabled={step === scene.steps.length - 1} onClick={() => onChange(scene.id, step + 1)}>
            Next <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}