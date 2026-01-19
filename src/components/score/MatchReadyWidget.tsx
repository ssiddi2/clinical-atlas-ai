import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchReadyWidgetProps {
  score: number;
  passProbability: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  loading?: boolean;
}

export function MatchReadyWidget({
  score,
  passProbability,
  percentile,
  trend,
  trendValue,
  loading = false
}: MatchReadyWidgetProps) {
  const navigate = useNavigate();

  // Score range: 196-300 → percentage for the arc
  const minScore = 196;
  const maxScore = 300;
  const percentage = ((score - minScore) / (maxScore - minScore)) * 100;

  // Arc parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius * 0.75;
  const offset = circumference * (1 - percentage / 100);

  const getScoreColor = () => {
    if (score >= 250) return 'hsl(var(--livemed-success))';
    if (score >= 230) return 'hsl(var(--livemed-cyan))';
    if (score >= 210) return 'hsl(var(--livemed-blue))';
    return 'hsl(var(--livemed-warning))';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-muted/30" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted/30 rounded" />
            <div className="h-6 w-20 bg-muted/30 rounded" />
            <div className="h-3 w-24 bg-muted/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 shadow-glow cursor-pointer hover:border-primary/40 transition-all"
      onClick={() => navigate('/score-predictor')}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-sm sm:text-base">MATCH Ready™</h3>
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mini gauge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-135">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted) / 0.3)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
              stroke={getScoreColor()}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="drop-shadow-[0_0_6px_currentColor]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-foreground">{score}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Step 1</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
            <span className="text-xl sm:text-2xl font-bold text-foreground">{passProbability}%</span>
            <span className="text-xs sm:text-sm text-muted-foreground truncate">Pass Probability</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{percentile}th</span> percentile
            </span>
            <div className={`flex items-center gap-0.5 sm:gap-1 ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
            }`}>
              <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{trendValue > 0 ? '+' : ''}{trendValue}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 sm:mt-3 h-7 sm:h-8 px-2 sm:px-3 text-xs text-primary hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/score-predictor');
            }}
          >
            View Full Analysis
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
