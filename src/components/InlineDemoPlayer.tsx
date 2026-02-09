import { useState, useEffect, useCallback, useRef, forwardRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play } from "lucide-react";

// Lazy-load all scene components — only current scene loads
const AtlasScene = lazy(() => import("./demo/AtlasScene"));
const RotationScene = lazy(() => import("./demo/RotationScene"));
const DashboardScene = lazy(() => import("./demo/DashboardScene"));
const InstitutionalScene = lazy(() => import("./demo/InstitutionalScene"));

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
      {/* Label */}
      <div className="flex justify-center mb-4">
        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/30 font-medium">
          Live Clinical Simulation
        </span>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm overflow-hidden shadow-[0_8px_40px_-12px_hsl(230,60%,5%/0.6)]">
        {/* Scene Content — responsive height */}
        <div className="relative h-[480px] min-[380px]:h-[500px] md:h-[520px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              }>
                <CurrentSceneComponent isActive={!isPaused} />
              </Suspense>
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
        <div className="border-t border-white/[0.06] bg-white/[0.015] px-3 md:px-6 py-2.5 md:py-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 md:gap-2 mb-2.5 md:mb-3 overflow-x-auto flex-nowrap scrollbar-hide">
            <button
              onClick={togglePause}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors mr-0.5 md:mr-2 flex-shrink-0"
            >
              {isPaused ? (
                <Play className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
              ) : (
                <Pause className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
              )}
            </button>
            {SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => handleTabClick(idx)}
                className={`text-[10px] md:text-sm font-medium px-2 md:px-3 py-1 md:py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
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
