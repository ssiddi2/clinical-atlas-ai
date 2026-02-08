import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Target, 
  BookOpen, 
  Lightbulb,
  Brain,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useScorePredictor } from '@/hooks/useScorePredictor';
import { TopicHeatmap } from '@/components/score/TopicHeatmap';
import { ScoreHistory } from '@/components/score/ScoreHistory';
import { ContributingFactors } from '@/components/score/ContributingFactors';
import { PeerComparison } from '@/components/score/PeerComparison';
import livemedLogo from '@/assets/livemed-logo.png';

const ScorePredictor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { 
    prediction, 
    topicPerformance, 
    scoreHistory, 
    loading: predictorLoading 
  } = useScorePredictor(user?.id);

  if (loading || predictorLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Calculating your MATCH Ready™ Score...</p>
        </div>
      </div>
    );
  }

  // Default prediction if no data
  const defaultPrediction = {
    predictedStep1Score: 225,
    predictedStep2Score: 232,
    passProbabilityStep1: 85,
    passProbabilityStep2: 88,
    matchProbability: 82,
    confidenceInterval: { low: 210, high: 240 },
    contributingFactors: {
      questionAccuracy: 70,
      clinicalReasoning: 65,
      knowledgeCoverage: 50,
      speedEfficiency: 70,
      performanceTrend: 70
    },
    percentile: 68,
    trend: 'stable' as const,
    trendValue: 0
  };

  const currentPrediction = prediction || defaultPrediction;

  // Personalized recommendations based on weak areas
  const getRecommendations = () => {
    const recommendations = [];
    const factors = currentPrediction.contributingFactors;

    if (factors.knowledgeCoverage < 60) {
      recommendations.push({
        icon: BookOpen,
        title: 'Expand Knowledge Coverage',
        description: `Complete more curriculum modules to boost your score by an estimated +${Math.round((60 - factors.knowledgeCoverage) * 0.3)} points`,
        action: () => navigate('/curriculum'),
        actionText: 'Go to Curriculum'
      });
    }

    if (factors.clinicalReasoning < 70) {
      recommendations.push({
        icon: Brain,
        title: 'Strengthen Clinical Reasoning',
        description: 'Practice with case-based scenarios in Virtual Rounds',
        action: () => navigate('/virtual-rounds'),
        actionText: 'Join Virtual Rounds'
      });
    }

    if (factors.questionAccuracy < 75) {
      recommendations.push({
        icon: Target,
        title: 'Improve Question Accuracy',
        description: `Focus on ${topicPerformance.find(t => t.score < 60)?.topic || 'weak topics'} to gain predicted points`,
        action: () => navigate('/assessments'),
        actionText: 'Practice Questions'
      });
    }

    // Always add ATLAS recommendation
    recommendations.push({
      icon: Sparkles,
      title: 'Ask ATLAS™ for Guidance',
      description: 'Get personalized study strategies based on your performance',
      action: () => navigate('/atlas'),
      actionText: 'Chat with ATLAS'
    });

    return recommendations.slice(0, 3);
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img 
                src={livemedLogo} 
                alt="Livemed" 
                className="h-6 sm:h-8 w-auto logo-glow cursor-pointer" 
                onClick={() => navigate('/dashboard')}
              />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              MATCH Ready™ Performance Tracker
            </h1>
          </div>
        </div>
      </header>

      {/* Educational Disclaimer Banner */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-xs sm:text-sm text-amber-200/80">
            <strong>Educational Tool:</strong> These performance insights are based on your platform activity and are not predictive of actual USMLE outcomes. 
            Consult official NBME resources for exam preparation guidance.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section with Pass Probability (Step 1 is Pass/Fail now) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your USMLE Performance Insights
          </h2>
          <p className="text-muted-foreground mb-8">
            Based on your assessments, curriculum progress, and clinical reasoning
          </p>

          {/* Step 1 Pass Probability (since Step 1 is now Pass/Fail) */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Step 1 (Pass/Fail)</h3>
              <div className="text-4xl font-bold text-green-400 mb-1">
                {currentPrediction.passProbabilityStep1}%
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated Pass Probability
              </p>
              <p className="text-xs text-muted-foreground mt-2 opacity-60">
                Step 1 transitioned to Pass/Fail in January 2022
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Step 2 CK Projection</h3>
              <div className="text-4xl font-bold text-accent mb-1">
                {currentPrediction.confidenceInterval.low}-{currentPrediction.confidenceInterval.high}
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated Score Range
              </p>
              <p className="text-xs text-muted-foreground mt-2 opacity-60">
                {currentPrediction.passProbabilityStep2}% pass probability
              </p>
            </Card>
          </div>

          {/* Peer Percentile */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-border text-sm">
            <span className="text-muted-foreground">Platform Percentile:</span>
            <span className="font-medium text-foreground">
              {currentPrediction.percentile}th among Livemed students
            </span>
          </div>
        </motion.section>

        {/* Removed old Step 2 CK Preview section - now integrated above */}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Contributing Factors */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Score Breakdown</h3>
              <ContributingFactors factors={currentPrediction.contributingFactors} />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Score History</h3>
              <ScoreHistory data={scoreHistory} targetScore={240} />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Topic Performance</h3>
              <TopicHeatmap 
                topics={topicPerformance} 
                onTopicClick={(topic) => navigate(`/curriculum?topic=${topic}`)}
              />
            </Card>
          </motion.div>

          {/* Right Column - Peer Comparison & Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <PeerComparison percentile={currentPrediction.percentile} />

            {/* Match Probability */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Match Probability</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {currentPrediction.matchProbability}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Likelihood of matching to your target specialty
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                Based on USMLE scores, clinical experience, and program competitiveness
              </div>
            </Card>

            {/* Personalized Recommendations */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-foreground">Recommendations</h3>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, index) => {
                  const Icon = rec.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={rec.action}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm">{rec.title}</div>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* CTA */}
            <Card className="p-6 bg-gradient-to-br from-livemed-cyan/10 via-primary/10 to-transparent border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Boost Your Score</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take a practice assessment to update your prediction and identify areas for improvement.
              </p>
              <Button 
                className="w-full btn-glow"
                onClick={() => navigate('/assessments')}
              >
                Start Assessment
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ScorePredictor;
