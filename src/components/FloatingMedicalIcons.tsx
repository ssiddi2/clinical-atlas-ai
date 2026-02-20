import { memo } from "react";
import { 
  Brain, 
  Stethoscope, 
  HeartPulse, 
  Dna, 
  Microscope,
  Activity,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const iconConfigs = [
  { Icon: Brain, position: { top: "12%", left: "6%" }, delay: "0s", size: 52 },
  { Icon: Stethoscope, position: { top: "20%", right: "8%" }, delay: "1.2s", size: 48 },
  { Icon: Dna, position: { bottom: "35%", left: "4%" }, delay: "0.5s", size: 44 },
  { Icon: HeartPulse, position: { bottom: "25%", right: "6%" }, delay: "1.8s", size: 50 },
  { Icon: Microscope, position: { bottom: "45%", right: "3%" }, delay: "1.5s", size: 46 },
  { Icon: Activity, position: { top: "65%", left: "5%" }, delay: "2.5s", size: 38 },
];

const FloatingMedicalIcons = memo(() => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {iconConfigs.slice(0, 3).map(({ Icon, position, size }, index) => (
          <div key={index} className="absolute" style={position}>
            <Icon className="text-livemed-cyan/15" size={size} strokeWidth={1} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {iconConfigs.map(({ Icon, position, delay, size }, index) => (
        <div
          key={index}
          className="absolute animate-float-icon"
          style={{
            ...position,
            animationDelay: delay,
            animationDuration: `${7 + index * 0.8}s`,
          }}
        >
          <Icon 
            className="text-livemed-cyan/[0.08]" 
            size={size} 
            strokeWidth={1}
          />
        </div>
      ))}
    </div>
  );
});

FloatingMedicalIcons.displayName = "FloatingMedicalIcons";

export default FloatingMedicalIcons;
