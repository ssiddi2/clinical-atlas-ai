import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Stethoscope, 
  HeartPulse, 
  Dna, 
  Pill, 
  Syringe,
  Microscope,
  Activity,
  Scan,
  TestTube,
  Clipboard,
  Eye
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const iconConfigs = [
  { Icon: Brain, position: { top: "12%", left: "6%" }, delay: 0, duration: 7, size: 52 },
  { Icon: Stethoscope, position: { top: "20%", right: "8%" }, delay: 1.2, duration: 8, size: 48 },
  { Icon: Dna, position: { bottom: "35%", left: "4%" }, delay: 0.5, duration: 9, size: 44 },
  { Icon: HeartPulse, position: { bottom: "25%", right: "6%" }, delay: 1.8, duration: 7.5, size: 50 },
  { Icon: Pill, position: { top: "50%", left: "2%" }, delay: 2.2, duration: 8.5, size: 40 },
  { Icon: Syringe, position: { top: "35%", right: "4%" }, delay: 0.8, duration: 7.8, size: 42 },
  { Icon: Microscope, position: { bottom: "45%", right: "3%" }, delay: 1.5, duration: 8.2, size: 46 },
  { Icon: Activity, position: { top: "65%", left: "5%" }, delay: 2.5, duration: 7.2, size: 38 },
  { Icon: TestTube, position: { bottom: "15%", left: "8%" }, delay: 3, duration: 8.8, size: 36 },
  { Icon: Scan, position: { top: "8%", right: "12%" }, delay: 0.3, duration: 9.2, size: 40 },
  { Icon: Clipboard, position: { bottom: "55%", left: "7%" }, delay: 1.8, duration: 7.6, size: 34 },
  { Icon: Eye, position: { top: "75%", right: "10%" }, delay: 2.8, duration: 8.4, size: 38 },
];

const FloatingMedicalIcons = memo(() => {
  const prefersReducedMotion = useReducedMotion();

  // On reduced motion, show static icons at low opacity
  const icons = useMemo(() => {
    if (prefersReducedMotion) {
      // Show fewer, static icons
      return iconConfigs.slice(0, 4).map(({ Icon, position, size }, index) => (
        <div key={index} className="absolute" style={position}>
          <Icon className="text-livemed-cyan/15" size={size} strokeWidth={1} />
        </div>
      ));
    }

    return iconConfigs.map(({ Icon, position, delay, duration, size }, index) => (
      <motion.div
        key={index}
        className="absolute"
        style={position}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0, 0.25, 0.25, 0],
          scale: [0.8, 1, 1, 0.8],
          y: [0, -25, -50, -75],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -18, 0],
            rotate: [0, 6, -6, 0],
          }}
          transition={{
            duration: duration * 0.55,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Glow halo behind icon */}
          <div 
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: "radial-gradient(circle, hsl(190 95% 55% / 0.15) 0%, transparent 70%)",
              transform: "scale(2)",
            }}
          />
          <Icon 
            className="text-livemed-cyan/30 relative z-10" 
            size={size} 
            strokeWidth={1}
          />
        </motion.div>
      </motion.div>
    ));
  }, [prefersReducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {icons}
    </div>
  );
});

FloatingMedicalIcons.displayName = "FloatingMedicalIcons";

export default FloatingMedicalIcons;
