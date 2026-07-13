import { lazy, Suspense, useState, useEffect } from "react";

// Only load the lightest animation layer
const GradientOrbs = lazy(() => import("./GradientOrbs"));

const HeroBackground = () => {
  const [showAnimations, setShowAnimations] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) return;
    const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 50));
    const id = schedule(() => setShowAnimations(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base Layer - soft light radial wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 15%, hsl(222 100% 52% / 0.10) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 85% 20%, hsl(210 95% 60% / 0.08) 0%, transparent 55%),
            hsl(0 0% 100%)
          `,
        }}
      />

      {showAnimations && (
        <Suspense fallback={null}>
          <GradientOrbs />
        </Suspense>
      )}

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
};

export default HeroBackground;
