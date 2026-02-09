import { memo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const rings = [
  { delay: 0, duration: 4 },
  { delay: 1.3, duration: 4 },
  { delay: 2.6, duration: 4 },
];

const GlowRings = memo(() => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
      {rings.map((ring, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border border-livemed-cyan/5"
          style={{
            width: "40vw",
            height: "40vw",
            maxWidth: "600px",
            maxHeight: "600px",
            willChange: "transform, opacity",
          }}
          initial={{ scale: 0.8, opacity: 0.05 }}
          animate={{
            scale: [0.8, 2.5],
            opacity: [0.04, 0],
          }}
          transition={{
            duration: ring.duration,
            delay: ring.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Central glow point */}
      <div 
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(190 95% 55% / 0.3) 0%, transparent 70%)",
          boxShadow: "0 0 40px 20px hsl(190 95% 55% / 0.08)",
        }}
      />
    </div>
  );
});

GlowRings.displayName = "GlowRings";

export default GlowRings;
