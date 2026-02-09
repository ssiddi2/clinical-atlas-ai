import { lazy, Suspense, useState, useEffect } from "react";

// ALL animation components are lazy-loaded and deferred until after LCP
const GradientOrbs = lazy(() => import("./GradientOrbs"));
const GlowRings = lazy(() => import("./GlowRings"));
const ParticleBackground = lazy(() => import("./ParticleBackground"));
const DNAHelix = lazy(() => import("./DNAHelix"));
const ECGLine = lazy(() => import("./ECGLine"));
const FloatingMedicalIcons = lazy(() => import("./FloatingMedicalIcons"));

const HeroBackground = () => {
  const [showAnimations, setShowAnimations] = useState(false);

  useEffect(() => {
    // Skip ALL animation layers on mobile — only show static CSS gradient
    if (window.innerWidth < 768) return;

    const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 50));
    const id = schedule(() => setShowAnimations(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base Layer - Deep radial gradient (CSS only, renders instantly) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 20%, hsl(230 60% 12%) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, hsl(217 91% 20% / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 20% 70%, hsl(190 95% 30% / 0.15) 0%, transparent 50%),
            hsl(230 55% 6%)
          `,
        }}
      />
      
      {/* All animation layers deferred until after LCP — desktop only */}
      {showAnimations && (
        <Suspense fallback={null}>
          <GradientOrbs />
          <DNAHelix />
          <ParticleBackground />
          <GlowRings />
          <ECGLine />
          <FloatingMedicalIcons />
        </Suspense>
      )}
      
      {/* Subtle noise/grain overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Top fade for seamless header blend */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      
      {/* Bottom fade for content transition */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[hsl(230,55%,6%)] via-[hsl(230,55%,6%)/0.8] to-transparent" />
    </div>
  );
};

export default HeroBackground;
