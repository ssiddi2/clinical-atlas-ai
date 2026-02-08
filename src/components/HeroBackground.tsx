import GradientOrbs from "./GradientOrbs";
import GlowRings from "./GlowRings";
import ParticleBackground from "./ParticleBackground";
import DNAHelix from "./DNAHelix";
import ECGLine from "./ECGLine";
import FloatingMedicalIcons from "./FloatingMedicalIcons";

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base Layer - Deep radial gradient */}
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
      
      {/* DNA Helix Layer - Medical identity */}
      <DNAHelix />
      
      {/* Gradient Orbs Layer */}
      <GradientOrbs />
      
      {/* Particle Constellation Layer - Molecular network */}
      <ParticleBackground />
      
      {/* Glow Rings Layer */}
      <GlowRings />
      
      {/* ECG Heartbeat Line Layer */}
      <ECGLine />
      
      {/* Floating Medical Icons */}
      <FloatingMedicalIcons />
      
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
