import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface PeerComparisonProps {
  percentile: number;
  totalStudents?: number;
}

export function PeerComparison({ percentile, totalStudents = 1000 }: PeerComparisonProps) {
  // Calculate position for the indicator (0-100%)
  const position = percentile;
  
  // Distribution curve points (bell curve approximation)
  const generateBellCurve = () => {
    const points = [];
    for (let i = 0; i <= 100; i += 2) {
      // Bell curve formula
      const x = (i - 50) / 15;
      const y = Math.exp(-0.5 * x * x) * 100;
      points.push({ x: i, y });
    }
    return points;
  };

  const curvePoints = generateBellCurve();
  const pathD = `M ${curvePoints.map(p => `${p.x},${100 - p.y}`).join(' L ')}`;

  return (
    <div className="p-6 rounded-xl bg-muted/10 border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Peer Comparison</h3>
      </div>

      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30"
        >
          <span className="text-2xl font-bold text-primary">{percentile}th</span>
          <span className="text-sm text-muted-foreground">Percentile</span>
        </motion.div>
        <p className="text-sm text-muted-foreground mt-2">
          You're performing better than <span className="text-foreground font-medium">{percentile}%</span> of LIVEMED students
        </p>
      </div>

      {/* Bell curve visualization */}
      <div className="relative h-24 mt-4">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.3" />
              <stop offset="25%" stopColor="hsl(var(--livemed-warning))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--livemed-cyan))" stopOpacity="0.3" />
              <stop offset="75%" stopColor="hsl(var(--livemed-blue))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--livemed-success))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Filled area under curve */}
          <path
            d={`${pathD} L 100,100 L 0,100 Z`}
            fill="url(#curveGradient)"
          />
          
          {/* Curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.5"
          />
          
          {/* User position indicator */}
          <motion.line
            x1={position}
            y1="0"
            x2={position}
            y2="100"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
          
          <motion.circle
            cx={position}
            cy={100 - curvePoints.find(p => Math.abs(p.x - position) < 2)?.y || 50}
            r="3"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          />
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
          <span>Lower</span>
          <span>Average</span>
          <span>Higher</span>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Based on anonymized data from {totalStudents.toLocaleString()}+ LIVEMED students
      </div>
    </div>
  );
}
