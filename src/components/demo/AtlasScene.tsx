import { motion } from "framer-motion";
import { Brain, MessageSquare, Sparkles } from "lucide-react";

interface AtlasSceneProps {
  isActive: boolean;
}

const AtlasScene = ({ isActive }: AtlasSceneProps) => {
  const messages = [
    { role: "user", text: "I have a patient with chest pain and shortness of breath. What should I consider?" },
    { role: "atlas", text: "Let's think through this systematically. First, what are the life-threatening causes of chest pain we must rule out?" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8"
      >
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl gradient-livemed flex items-center justify-center">
          <Brain className="h-4 w-4 md:h-6 md:w-6 text-white" />
        </div>
        <div>
          <h3 className="text-base md:text-xl font-semibold text-white">ATLAS™ AI Professor</h3>
          <p className="text-xs md:text-sm text-white/50 hidden min-[380px]:block">Your personal faculty member, 24/7</p>
        </div>
        <div className="ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-livemed-success/20">
          <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-livemed-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-livemed-success"></span>
          </span>
          <span className="text-[10px] md:text-xs text-livemed-success">Online</span>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-xl glass-card rounded-2xl p-3 md:p-6 space-y-3 md:space-y-4"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            transition={{ duration: 0.4, delay: 0.6 + idx * 0.8 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-3 md:px-4 py-2.5 md:py-3 ${
                msg.role === "user"
                  ? "bg-livemed-blue/20 text-white/90"
                  : "bg-white/10 text-white/90 border border-white/10"
              }`}
            >
              {msg.role === "atlas" && (
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <Sparkles className="h-3 w-3 text-livemed-blue" />
                  <span className="text-[10px] md:text-xs text-livemed-blue font-medium">ATLAS</span>
                </div>
              )}
              <p className="text-xs md:text-sm leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 2.2 }}
          className="flex items-center gap-2 text-white/40 text-xs"
        >
          <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="text-[10px] md:text-sm">Using Socratic methodology...</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ●
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Feature Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 2.5 }}
        className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 md:mt-8"
      >
        {["Socratic Teaching", "Clinical Reasoning", "Personalized Learning"].map((tag, idx) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 2.7 + idx * 0.1 }}
            className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs text-white/60"
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default AtlasScene;
