import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface TopicPerformance {
  topic: string;
  score: number;
  questionsAnswered: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopicHeatmapProps {
  topics: TopicPerformance[];
  onTopicClick?: (topic: string) => void;
}

export function TopicHeatmap({ topics, onTopicClick }: TopicHeatmapProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/40 text-green-400';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
    return 'bg-red-500/20 border-red-500/40 text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sortedTopics = [...topics].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-3">
      {sortedTopics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Complete assessments to see your topic performance</p>
        </div>
      ) : (
        sortedTopics.map((topic, index) => (
          <motion.div
            key={topic.topic}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onTopicClick?.(topic.topic)}
            className={`group p-3 rounded-lg border ${getScoreColor(topic.score)} cursor-pointer hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">{topic.topic}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${
                  topic.score >= 80 ? 'text-green-400' : 
                  topic.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {topic.score}%
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getBarColor(topic.score)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {topic.questionsAnswered} Qs
              </span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
