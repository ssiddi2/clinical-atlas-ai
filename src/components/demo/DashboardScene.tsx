import { motion } from "framer-motion";
import { BarChart3, Award, BookOpen, TrendingUp } from "lucide-react";

interface DashboardSceneProps {
  isActive: boolean;
}

const DashboardScene = ({ isActive }: DashboardSceneProps) => {
  const modules = [
    { name: "Cardiology", progress: 85, color: "bg-red-500" },
    { name: "Pulmonology", progress: 72, color: "bg-blue-500" },
    { name: "Neurology", progress: 58, color: "bg-purple-500" },
    { name: "GI/Hepatology", progress: 45, color: "bg-green-500" },
  ];

  const achievements = [
    { icon: Award, title: "Case Master", desc: "50 cases completed" },
    { icon: TrendingUp, title: "Top Performer", desc: "95th percentile" },
    { icon: BookOpen, title: "Scholar", desc: "100 hours studied" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-y-auto p-3 md:p-8 pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8"
      >
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-livemed-blue/20 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 md:h-6 md:w-6 text-livemed-blue" />
        </div>
        <div>
          <h3 className="text-base md:text-xl font-semibold text-white">Student Dashboard</h3>
          <p className="text-xs md:text-sm text-white/50">Track your progress in real-time</p>
        </div>
      </motion.div>

      <div className="w-full max-w-2xl grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 md:gap-4">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-2xl p-4 md:p-6"
        >
          <h4 className="text-xs md:text-sm font-medium text-white/80 mb-3 md:mb-4">Module Progress</h4>
          <div className="space-y-2 md:space-y-3">
            {modules.map((module, idx) => (
              <motion.div
                key={module.name}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.6 + idx * 0.15 }}
              >
                <div className="flex justify-between text-[10px] md:text-xs mb-1">
                  <span className="text-white/70">{module.name}</span>
                  <span className="text-white/50">{module.progress}%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isActive ? { width: `${module.progress}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 0.8 + idx * 0.15, ease: "easeOut" }}
                    className={`h-full ${module.color} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card rounded-2xl p-4 md:p-6"
        >
          <h4 className="text-xs md:text-sm font-medium text-white/80 mb-3 md:mb-4">Achievements</h4>
          <div className="space-y-2 md:space-y-3">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 10 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.9 + idx * 0.2 }}
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-white/5"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-livemed flex items-center justify-center flex-shrink-0">
                  <achievement.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-white">{achievement.title}</p>
                  <p className="text-[10px] md:text-xs text-white/50">{achievement.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        className="w-full max-w-2xl grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4"
      >
        {[
          { label: "Cases Completed", value: "127" },
          { label: "Study Hours", value: "248" },
          { label: "Avg Score", value: "92%" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 1.8 + idx * 0.1 }}
            className="glass-card rounded-xl p-2.5 md:p-4 text-center"
          >
            <p className="text-lg md:text-2xl font-semibold text-gradient-livemed">{stat.value}</p>
            <p className="text-[9px] md:text-xs text-white/50 mt-0.5 md:mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardScene;
