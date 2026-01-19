import { motion } from 'framer-motion';
import { Brain, Target, BookOpen, Zap, TrendingUp } from 'lucide-react';

interface ContributingFactorsProps {
  factors: {
    questionAccuracy: number;
    clinicalReasoning: number;
    knowledgeCoverage: number;
    speedEfficiency: number;
    performanceTrend: number;
  };
}

export function ContributingFactors({ factors }: ContributingFactorsProps) {
  const factorConfig = [
    {
      key: 'questionAccuracy',
      label: 'Question Accuracy',
      description: 'Correct answers across all attempts',
      icon: Target,
      weight: '35%',
      value: factors.questionAccuracy
    },
    {
      key: 'clinicalReasoning',
      label: 'Clinical Reasoning',
      description: 'Performance on case-based questions',
      icon: Brain,
      weight: '25%',
      value: factors.clinicalReasoning
    },
    {
      key: 'knowledgeCoverage',
      label: 'Knowledge Coverage',
      description: 'Curriculum completion rate',
      icon: BookOpen,
      weight: '20%',
      value: factors.knowledgeCoverage
    },
    {
      key: 'speedEfficiency',
      label: 'Speed & Efficiency',
      description: 'Time management on questions',
      icon: Zap,
      weight: '10%',
      value: factors.speedEfficiency
    },
    {
      key: 'performanceTrend',
      label: 'Performance Trend',
      description: 'Improvement over recent attempts',
      icon: TrendingUp,
      weight: '10%',
      value: factors.performanceTrend
    }
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 85) return { text: 'Excellent', color: 'text-green-400' };
    if (score >= 70) return { text: 'Good', color: 'text-cyan-400' };
    if (score >= 55) return { text: 'Developing', color: 'text-yellow-400' };
    return { text: 'Needs Focus', color: 'text-red-400' };
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-cyan-500';
    if (score >= 55) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {factorConfig.map((factor, index) => {
        const Icon = factor.icon;
        const scoreLabel = getScoreLabel(factor.value);
        
        return (
          <motion.div
            key={factor.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 rounded-xl bg-muted/20 border border-border/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{factor.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {factor.weight}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">{factor.value}%</div>
                <div className={`text-xs font-medium ${scoreLabel.color}`}>{scoreLabel.text}</div>
              </div>
            </div>
            
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getBarColor(factor.value)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
