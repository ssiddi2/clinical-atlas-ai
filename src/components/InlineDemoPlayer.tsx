import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play } from "lucide-react";
import AtlasScene from "./demo/AtlasScene";
import RotationScene from "./demo/RotationScene";
import DashboardScene from "./demo/DashboardScene";
import InstitutionalScene from "./demo/InstitutionalScene";

const SCENES = [
  { id: "atlas", title: "ATLAS AI", duration: 8000, Component: AtlasScene },
  { id: "rotation", title: "Virtual Rotations", duration: 9000, Component: RotationScene },
  { id: "dashboard", title: "Dashboard", duration: 7000, Component: DashboardScene },
  { id: "institutional", title: "Get Started", duration: 8000, Component: InstitutionalScene },
];

const InlineDemoPlayer = forwardRef<HTMLDivElement>((_, ref) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
  }, []);

  const startScene = useCallback((index: number) => {
    clearTimers();
    setSceneProgress(0);

    const duration = SCENES[index].duration;
    const tick = 50;

    progressInterval.current = setInterval(() => {
      setSceneProgress((prev) => {
        const next = prev + (tick / duration) * 100;
        return Math.min(next, 100);
      });
    }, tick);

    sceneTimer.current = setTimeout(() => {
      const nextIndex = (index + 1) % SCENES.length;
      setCurrentScene(nextIndex);
    }, duration);
  }, [clearTimers]);

  useEffect(() => {
    if (!isPaused) {
      startScene(currentScene);
    }
    return clearTimers;
  }, [currentScene, isPaused, startScene, clearTimers]);

  const handleTabClick = (index: number) => {
    clearTimers();
    setCurrentScene(index);
    setSceneProgress(0);
    setIsPaused(false);
  };

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const CurrentSceneComponent = SCENES[currentScene].Component;

  return (
    <div ref={ref} className="w-full max-w-5xl mx-auto px-4 md:px-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/30">
        {/* Scene Content */}
        <div className="relative h-[420px] md:h-[520px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <CurrentSceneComponent isActive={!isPaused} />
            </motion.div>
          </AnimatePresence>

          {/* Pause overlay */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 cursor-pointer"
                onClick={togglePause}
              >
                <div className="text-white/80 text-sm font-medium">Paused</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="border-t border-white/5 bg-white/[0.02] px-4 md:px-6 py-3 md:py-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={togglePause}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors mr-2 flex-shrink-0"
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5 text-white" />
              ) : (
                <Pause className="h-3.5 w-3.5 text-white" />
              )}
            </button>
            {SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => handleTabClick(idx)}
                className={`text-xs md:text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                  idx === currentScene
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                {scene.title}
              </button>
            ))}
          </div>

          {/* Segmented progress bar */}
          <div className="flex gap-1">
            {SCENES.map((scene, idx) => (
              <div
                key={scene.id}
                className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-livemed-blue rounded-full"
                  style={{
                    width:
                      idx < currentScene
                        ? "100%"
                        : idx === currentScene
                        ? `${sceneProgress}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

InlineDemoPlayer.displayName = "InlineDemoPlayer";

export default InlineDemoPlayer;
