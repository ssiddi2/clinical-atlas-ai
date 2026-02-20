import { motion } from "framer-motion";
import { Globe, Users, GraduationCap, ArrowRight } from "lucide-react";

interface InstitutionalSceneProps {
  isActive: boolean;
}

const InstitutionalScene = ({ isActive }: InstitutionalSceneProps) => {
  const stats = [
    { icon: Globe, value: "50+", label: "Partner Hospitals" },
    { icon: Users, value: "8+", label: "Specialty Rotations" },
    { icon: GraduationCap, value: "Live", label: "US Physician Rounds" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-y-auto p-3 md:p-8 pt-4">
      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-6 md:mb-10"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl md:text-4xl font-semibold text-white mb-3 md:mb-4"
        >
          Transform Your
          <br />
          <span className="text-gradient-livemed">Medical Education</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-white/50 max-w-md mx-auto text-xs md:text-base"
        >
          Live virtual rotations across 8+ medical specialties.
        </motion.p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1 + idx * 0.15 }}
            className="glass-card rounded-xl md:rounded-2xl p-3 md:p-6 text-center"
          >
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl gradient-livemed flex items-center justify-center mx-auto mb-2 md:mb-4">
              <stat.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-lg md:text-2xl font-semibold text-gradient-livemed mb-0.5 md:mb-1">{stat.value}</p>
            <p className="text-[9px] md:text-xs text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="flex flex-col items-center gap-3 md:gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-glow gradient-livemed text-white px-6 md:px-8 py-3 md:py-4 rounded-full flex items-center gap-2 font-medium cursor-pointer text-sm md:text-base"
        >
          <span>Start Your Journey</span>
          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </motion.div>
        <p className="text-[10px] md:text-xs text-white/40">No credit card required • Free trial available</p>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 0.5 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-livemed-blue/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
      </motion.div>
    </div>
  );
};

export default InstitutionalScene;
