import { forwardRef } from "react";
import { Play, Brain, Sparkles } from "lucide-react";

interface DemoPreviewCardProps {
  onPlayDemo: () => void;
}

const DemoPreviewCard = forwardRef<HTMLDivElement, DemoPreviewCardProps>(
  ({ onPlayDemo }, ref) => {
    return (
      <div
        ref={ref}
        className="relative z-20 mt-12 md:mt-16 -mb-32 md:-mb-48 mx-auto max-w-4xl px-4 md:px-6 cursor-pointer group"
        onClick={onPlayDemo}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-lg shadow-black/20">
          {/* Browser Chrome Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Brain className="h-3.5 w-3.5 text-livemed-cyan/70" />
              <span className="text-xs font-medium text-white/50 tracking-wide">ATLAS™</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-5 md:p-8 space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-livemed-blue/15 text-white/80 text-sm leading-relaxed">
                I have a patient with chest pain and shortness of breath. What should I consider?
              </div>
            </div>

            {/* ATLAS response */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/[0.05] border border-white/5 text-white/80 text-sm leading-relaxed">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3 w-3 text-livemed-cyan/70" />
                  <span className="text-[11px] text-livemed-cyan/70 font-medium">ATLAS</span>
                </div>
                Let's think through this systematically. What are the life-threatening causes of chest pain we need to rule out first?
              </div>
            </div>

            {/* User follow-up */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-livemed-blue/15 text-white/80 text-sm leading-relaxed">
                I would consider ACS, PE, aortic dissection, and tension pneumothorax.
              </div>
            </div>
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-livemed-deep/80 via-livemed-deep/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Play className="h-6 w-6 md:h-7 md:w-7 text-white ml-0.5" />
            </div>
            <span className="text-sm font-medium text-white/80">Watch Full Demo</span>
          </div>
        </div>
      </div>
    );
  }
);

DemoPreviewCard.displayName = "DemoPreviewCard";

export default DemoPreviewCard;
