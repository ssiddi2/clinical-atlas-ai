import { motion } from "framer-motion";
import { Stethoscope, Activity, FileText, CheckCircle } from "lucide-react";

interface RotationSceneProps {
  isActive: boolean;
}

const RotationScene = ({ isActive }: RotationSceneProps) => {
  const vitals = [
    { label: "BP", value: "165/95", unit: "mmHg", status: "warning" },
    { label: "HR", value: "110", unit: "bpm", status: "warning" },
    { label: "SpO2", value: "94", unit: "%", status: "warning" },
    { label: "Temp", value: "37.2", unit: "°C", status: "normal" },
  ];

  const differentials = [
    { name: "Acute Coronary Syndrome", selected: true },
    { name: "Pulmonary Embolism", selected: true },
    { name: "Aortic Dissection", selected: false },
    { name: "Pneumothorax", selected: false },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-y-auto p-3 md:p-8 pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6"
      >
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Stethoscope className="h-4 w-4 md:h-6 md:w-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-base md:text-xl font-semibold text-white">Virtual Clinical Rotation</h3>
          <p className="text-xs md:text-sm text-white/50">Internal Medicine - Day 1</p>
        </div>
      </motion.div>

      {/* Patient Case Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-2xl glass-card rounded-2xl p-4 md:p-6 mb-3 md:mb-4"
      >
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div>
            <span className="text-[10px] md:text-xs text-orange-400 font-medium uppercase tracking-wider">New Admission</span>
            <h4 className="text-sm md:text-lg font-semibold text-white mt-0.5 md:mt-1">55-year-old Male</h4>
            <p className="text-xs md:text-sm text-white/60">Chief Complaint: Substernal chest pain × 2 hours</p>
          </div>
          <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] md:text-xs font-medium">
            Urgent
          </span>
        </div>

        {/* Vitals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-1.5 md:gap-3 mb-3 md:mb-4"
        >
          {vitals.map((vital, idx) => (
            <motion.div
              key={vital.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 1 + idx * 0.1 }}
              className={`p-2 md:p-3 rounded-lg md:rounded-xl ${
                vital.status === "warning" ? "bg-orange-500/10 border border-orange-500/20" : "bg-white/5 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5 md:mb-1">
                <Activity className={`h-2.5 w-2.5 md:h-3 md:w-3 ${vital.status === "warning" ? "text-orange-400" : "text-white/40"}`} />
                <span className="text-[9px] md:text-xs text-white/50">{vital.label}</span>
              </div>
              <p className={`text-sm md:text-lg font-semibold ${vital.status === "warning" ? "text-orange-400" : "text-white"}`}>
                {vital.value}
                <span className="text-[8px] md:text-xs font-normal text-white/40 ml-0.5 md:ml-1">{vital.unit}</span>
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Differential Diagnosis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="w-full max-w-2xl glass-card rounded-2xl p-4 md:p-6"
      >
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-livemed-blue" />
          <span className="text-xs md:text-sm font-medium text-white">Select Differential Diagnosis</span>
        </div>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-1.5 md:gap-2">
          {differentials.map((dx, idx) => (
            <motion.div
              key={dx.name}
              initial={{ opacity: 0, x: -10 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 1.8 + idx * 0.15 }}
              className={`flex items-center gap-2 p-2 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all ${
                dx.selected ? "bg-livemed-blue/20 border border-livemed-blue/40" : "bg-white/5 border border-white/10"
              }`}
            >
              <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                dx.selected ? "bg-livemed-blue" : "bg-white/10"
              }`}>
                {dx.selected && <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />}
              </div>
              <span className={`text-[11px] md:text-sm ${dx.selected ? "text-white" : "text-white/60"}`}>{dx.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RotationScene;
