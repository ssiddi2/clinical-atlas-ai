import { motion } from "framer-motion";
import { Brain, Stethoscope, HeartPulse, Dna, Pill, Syringe } from "lucide-react";

const icons = [
  { Icon: Brain, position: { top: "15%", left: "8%" }, delay: 0, duration: 6 },
  { Icon: Stethoscope, position: { top: "25%", right: "10%" }, delay: 1, duration: 7 },
  { Icon: Dna, position: { bottom: "30%", left: "5%" }, delay: 0.5, duration: 8 },
  { Icon: HeartPulse, position: { bottom: "20%", right: "8%" }, delay: 1.5, duration: 6.5 },
  { Icon: Pill, position: { top: "45%", left: "3%" }, delay: 2, duration: 7.5 },
  { Icon: Syringe, position: { top: "40%", right: "5%" }, delay: 0.8, duration: 6.8 },
];

const FloatingMedicalIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, position, delay, duration }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={position}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.15, 0.15, 0],
            scale: [0.8, 1, 1, 0.8],
            y: [0, -20, -40, -60],
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
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: duration * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon 
              className="text-livemed-cyan/20" 
              size={48} 
              strokeWidth={1}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingMedicalIcons;
