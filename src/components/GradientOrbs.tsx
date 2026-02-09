import { memo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Orb {
  id: number;
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  colors: [string, string];
  blur: number;
  opacity: number;
}

const orbs: Orb[] = [
  {
    id: 1,
    size: 700,
    x: "-15%",
    y: "-20%",
    delay: 0,
    duration: 25,
    colors: ["hsl(190, 100%, 50%)", "hsl(210, 100%, 60%)"],
    blur: 180,
    opacity: 0.2,
  },
  {
    id: 2,
    size: 500,
    x: "70%",
    y: "10%",
    delay: 2,
    duration: 30,
    colors: ["hsl(217, 91%, 60%)", "hsl(240, 60%, 45%)"],
    blur: 150,
    opacity: 0.15,
  },
  {
    id: 3,
    size: 600,
    x: "50%",
    y: "60%",
    delay: 4,
    duration: 28,
    colors: ["hsl(200, 100%, 50%)", "hsl(190, 95%, 55%)"],
    blur: 160,
    opacity: 0.18,
  },
  {
    id: 4,
    size: 450,
    x: "-10%",
    y: "70%",
    delay: 1,
    duration: 22,
    colors: ["hsl(230, 60%, 35%)", "hsl(217, 91%, 60%)"],
    blur: 140,
    opacity: 0.15,
  },
  {
    id: 5,
    size: 350,
    x: "85%",
    y: "75%",
    delay: 3,
    duration: 26,
    colors: ["hsl(180, 80%, 45%)", "hsl(200, 100%, 50%)"],
    blur: 120,
    opacity: 0.12,
  },
];

const GradientOrbs = memo(() => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {orbs.map((orb) => (
        prefersReducedMotion ? (
          <div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle at 30% 30%, ${orb.colors[0]}, ${orb.colors[1]})`,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              willChange: "auto",
            }}
          />
        ) : (
          <motion.div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle at 30% 30%, ${orb.colors[0]}, ${orb.colors[1]})`,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              willChange: "transform",
            }}
            animate={{
              x: [0, 30, -20, 10, 0],
              y: [0, -20, 30, 10, 0],
              scale: [1, 1.05, 0.95, 1.02, 1],
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "40% 60% 60% 40% / 70% 30% 70% 40%",
                "60% 40% 40% 60% / 40% 70% 40% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              ],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      ))}
    </div>
  );
});

GradientOrbs.displayName = "GradientOrbs";

export default GradientOrbs;
