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
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Stethoscope className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Virtual Clinical Rotation</h3>
          <p className="text-sm text-white/50">Internal Medicine - Day 1</p>
        </div>
      </motion.div>

      {/* Patient Case Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-2xl glass-card rounded-2xl p-6 mb-4"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">New Admission</span>
            <h4 className="text-lg font-semibold text-white mt-1">55-year-old Male</h4>
            <p className="text-sm text-white/60">Chief Complaint: Substernal chest pain × 2 hours</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
            Urgent
          </span>
        </div>

        {/* Vitals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="grid grid-cols-4 gap-3 mb-4"
        >
          {vitals.map((vital, idx) => (
            <motion.div
              key={vital.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 1 + idx * 0.1 }}
              className={`p-3 rounded-xl ${
                vital.status === "warning" ? "bg-orange-500/10 border border-orange-500/20" : "bg-white/5 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <Activity className={`h-3 w-3 ${vital.status === "warning" ? "text-orange-400" : "text-white/40"}`} />
                <span className="text-xs text-white/50">{vital.label}</span>
              </div>
              <p className={`text-lg font-semibold ${vital.status === "warning" ? "text-orange-400" : "text-white"}`}>
                {vital.value}
                <span className="text-xs font-normal text-white/40 ml-1">{vital.unit}</span>
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
        className="w-full max-w-2xl glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-livemed-blue" />
          <span className="text-sm font-medium text-white">Select Differential Diagnosis</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {differentials.map((dx, idx) => (
            <motion.div
              key={dx.name}
              initial={{ opacity: 0, x: -10 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 1.8 + idx * 0.15 }}
              className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                dx.selected ? "bg-livemed-blue/20 border border-livemed-blue/40" : "bg-white/5 border border-white/10"
              }`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                dx.selected ? "bg-livemed-blue" : "bg-white/10"
              }`}>
                {dx.selected && <CheckCircle className="h-3 w-3 text-white" />}
              </div>
              <span className={`text-sm ${dx.selected ? "text-white" : "text-white/60"}`}>{dx.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RotationScene;
