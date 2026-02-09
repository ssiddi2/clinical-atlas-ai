import { memo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ECGLine = memo(() => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  // Authentic P-QRS-T complex ECG waveform path
  const ecgPath = `
    M 0 50
    L 20 50
    C 25 50, 30 48, 35 50
    L 40 50
    C 42 50, 44 52, 46 50
    L 50 50
    L 55 50
    L 58 45
    L 62 70
    L 66 20
    L 70 55
    L 74 50
    L 80 50
    C 85 50, 90 45, 95 42
    C 100 39, 105 44, 110 50
    L 130 50
    L 150 50
  `;

  // Fewer ECG lines for performance
  const ecgLines = [
    { y: "70%", delay: 0, opacity: 0.04, scale: 1 },
    { y: "85%", delay: 2, opacity: 0.03, scale: 0.8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ecgLines.map((line, index) => (
        <motion.div
          key={index}
          className="absolute left-0 right-0"
          style={{ top: line.y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: line.delay * 0.5, duration: 2 }}
        >
          <svg
            viewBox="0 0 150 100"
            className="w-full"
            style={{
              height: `${60 * line.scale}px`,
              opacity: line.opacity,
            }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`ecgGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(160, 84%, 45%)" stopOpacity="0" />
                <stop offset="20%" stopColor="hsl(160, 84%, 45%)" stopOpacity="1" />
                <stop offset="80%" stopColor="hsl(190, 95%, 55%)" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(190, 95%, 55%)" stopOpacity="0" />
              </linearGradient>
              
              <filter id={`ecgGlow-${index}`}>
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            <g filter={`url(#ecgGlow-${index})`}>
              {/* Reduced repeats from 8 to 5 */}
              {[0, 1, 2, 3, 4].map((repeat) => (
                <motion.path
                  key={repeat}
                  d={ecgPath}
                  fill="none"
                  stroke={`url(#ecgGradient-${index})`}
                  strokeWidth={1.5 * line.scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: `translateX(${repeat * 150 - 150}px)`,
                  }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: [0, 1, 1, 0],
                    x: [0, -150],
                  }}
                  transition={{
                    pathLength: { duration: 2, ease: "linear" },
                    opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                    x: { 
                      duration: 8, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: line.delay + repeat * 0.5,
                    },
                  }}
                />
              ))}
            </g>
          </svg>
        </motion.div>
      ))}
      
      {/* Subtle heartbeat pulse indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "72%" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{
          background: "radial-gradient(circle, hsl(160 84% 45% / 0.25) 0%, transparent 70%)",
            boxShadow: "0 0 15px 8px hsl(160 84% 45% / 0.06)",
          }}
        />
      </motion.div>
    </div>
  );
});

ECGLine.displayName = "ECGLine";

export default ECGLine;
