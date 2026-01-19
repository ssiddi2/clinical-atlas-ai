import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  passProbability: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({
  score,
  label,
  passProbability,
  percentile,
  trend,
  trendValue,
  size = 'lg'
}: ScoreGaugeProps) {
  const sizeConfig = {
    sm: { container: 'w-32 h-32', text: 'text-2xl', label: 'text-xs' },
    md: { container: 'w-48 h-48', text: 'text-4xl', label: 'text-sm' },
    lg: { container: 'w-64 h-64', text: 'text-5xl', label: 'text-base' }
  };

  const config = sizeConfig[size];
  
  // Score range: 196-300 → percentage for the arc
  const minScore = 196;
  const maxScore = 300;
  const percentage = ((score - minScore) / (maxScore - minScore)) * 100;
  
  // Calculate arc parameters
  const radius = size === 'lg' ? 100 : size === 'md' ? 75 : 50;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 degrees
  const offset = circumference * (1 - percentage / 100);

  // Color based on score
  const getScoreColor = () => {
    if (score >= 250) return 'hsl(var(--livemed-success))';
    if (score >= 230) return 'hsl(var(--livemed-cyan))';
    if (score >= 210) return 'hsl(var(--livemed-blue))';
    return 'hsl(var(--livemed-warning))';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${config.container}`}>
        <svg className="w-full h-full -rotate-135">
          {/* Background arc */}
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
          
          {/* Progress arc */}
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
            className="drop-shadow-[0_0_8px_currentColor]"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${config.text} font-bold text-foreground`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className={`${config.label} text-muted-foreground uppercase tracking-wider`}>
            {label}
          </span>
        </div>
      </div>

      {/* Stats below gauge */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{passProbability}%</div>
          <div className="text-xs text-muted-foreground">Pass Probability</div>
        </div>
        
        <div className="w-px h-8 bg-border" />
        
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{percentile}th</div>
          <div className="text-xs text-muted-foreground">Percentile</div>
        </div>
        
        <div className="w-px h-8 bg-border" />
        
        <div className="text-center flex flex-col items-center">
          <div className={`flex items-center gap-1 text-lg font-semibold ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
          }`}>
            <TrendIcon className="w-4 h-4" />
            {trendValue > 0 ? '+' : ''}{trendValue}
          </div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
      </div>
    </div>
  );
}
