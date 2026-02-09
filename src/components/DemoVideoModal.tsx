import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pause, Play, SkipForward } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Lazy load scene components - only needed when modal opens
const AtlasScene = lazy(() => import("./demo/AtlasScene"));
const RotationScene = lazy(() => import("./demo/RotationScene"));
const DashboardScene = lazy(() => import("./demo/DashboardScene"));
const InstitutionalScene = lazy(() => import("./demo/InstitutionalScene"));

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCENES = [
  { id: "atlas", title: "ATLAS AI", duration: 5000, Component: AtlasScene },
  { id: "rotation", title: "Virtual Rotations", duration: 6000, Component: RotationScene },
  { id: "dashboard", title: "Dashboard", duration: 4000, Component: DashboardScene },
  { id: "institutional", title: "Get Started", duration: 5000, Component: InstitutionalScene },
];

const TOTAL_DURATION = SCENES.reduce((acc, scene) => acc + scene.duration, 0);

const DemoVideoModal = ({ isOpen, onClose }: DemoVideoModalProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const skipToNext = useCallback(() => {
    if (currentScene < SCENES.length - 1) {
      setCurrentScene((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentScene, onClose]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Auto-advance scenes
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const timer = setTimeout(() => {
      if (currentScene < SCENES.length - 1) {
        setCurrentScene((prev) => prev + 1);
      }
    }, SCENES[currentScene].duration);

    return () => clearTimeout(timer);
  }, [currentScene, isOpen, isPaused]);

  // Progress bar
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / TOTAL_DURATION) * 50;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, isPaused]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentScene(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      }
      if (e.key === "ArrowRight") skipToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, togglePause, skipToNext]);

  const CurrentSceneComponent = SCENES[currentScene].Component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[80vh] p-0 bg-livemed-navy border-white/10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Scene Content */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              }>
                <CurrentSceneComponent isActive={!isPaused} />
              </Suspense>
            </motion.div>
          </AnimatePresence>

          {/* Overlay for pause */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
              >
                <div className="text-white text-lg font-medium">Paused</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress Bar */}
          <div className="flex gap-1 mb-4">
            {SCENES.map((scene, idx) => (
              <div
                key={scene.id}
                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={() => setCurrentScene(idx)}
              >
                <motion.div
                  className="h-full bg-livemed-blue rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      idx < currentScene
                        ? "100%"
                        : idx === currentScene
                        ? `${((progress - (idx * 100) / SCENES.length) / (100 / SCENES.length)) * 100}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePause}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isPaused ? (
                  <Play className="h-4 w-4 text-white" />
                ) : (
                  <Pause className="h-4 w-4 text-white" />
                )}
              </button>
              <button
                onClick={skipToNext}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipForward className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Scene Indicators */}
            <div className="flex items-center gap-4">
              {SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => setCurrentScene(idx)}
                  className={`text-xs font-medium transition-colors ${
                    idx === currentScene ? "text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {scene.title}
                </button>
              ))}
            </div>

            {/* Duration */}
            <div className="text-xs text-white/40">
              {Math.ceil((TOTAL_DURATION - (progress / 100) * TOTAL_DURATION) / 1000)}s
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;
