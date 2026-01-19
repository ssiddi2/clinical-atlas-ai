import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

const Residency = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const competencyAreas = [
    { name: "Clinical Knowledge", score: 78, icon: BookOpen, description: "Medical facts, concepts, and principles" },
    { name: "Clinical Reasoning", score: 70, icon: Brain, description: "Diagnostic and therapeutic decision-making" },
    { name: "Communication", score: 68, icon: MessageSquare, description: "Patient and team interactions" },
    { name: "Professionalism", score: 82, icon: Users, description: "Ethics, responsibility, and integrity" },
    { name: "Practice-Based Learning", score: 65, icon: TrendingUp, description: "Self-improvement and evidence-based practice" },
    { name: "Systems-Based Practice", score: 60, icon: Target, description: "Healthcare systems and patient safety" },
  ];

  const milestones = [
    { title: "Complete 80% of Curriculum", completed: false, current: true, progress: 65 },
    { title: "Pass 3 Practice Assessments", completed: true, current: false },
    { title: "Finish 2 Virtual Rotations", completed: false, current: false, progress: 50 },
    { title: "ATLAS™ 50+ Conversations", completed: true, current: false },
    { title: "Submit Mock ERAS Application", completed: false, current: false },
  ];

  const recommendations = [
    {
      title: "Focus on Systems-Based Practice",
      description: "Your lowest scoring area. Complete the Healthcare Quality & Safety module.",
      action: "Start Module",
      href: "/curriculum",
    },
    {
      title: "Practice More Clinical Cases",
      description: "Improve clinical reasoning with virtual rotation scenarios.",
      action: "Start Rotation",
      href: "/rotation-experience",
    },
    {
      title: "Review Communication Skills",
      description: "Use ATLAS™ to practice patient counseling scenarios.",
      action: "Chat with ATLAS™",
      href: "/atlas",
    },
  ];

  const overallScore = Math.round(
    competencyAreas.reduce((sum, area) => sum + area.score, 0) / competencyAreas.length
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/dashboard">
              <img src={livemedLogo} alt="LIVEMED" style={{ height: '80px', width: 'auto' }} className="object-contain" />
            </Link>
          </div>
          <h1 className="text-lg font-semibold">Residency Readiness</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Overall Score */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full gradient-livemed mb-4">
            <div className="text-center text-white">
              <div className="text-4xl font-bold">{overallScore}%</div>
              <div className="text-sm opacity-80">Ready</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Residency Readiness Score</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on your curriculum progress, assessment scores, clinical reasoning, and rotation performance.
            Keep learning to improve your match competitiveness!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Competency Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Core Competencies (ACGME Framework)
                </CardTitle>
                <CardDescription>
                  Your performance across the six core competencies required for residency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {competencyAreas.map((area) => (
                    <div key={area.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <area.icon className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-xs text-muted-foreground">{area.description}</p>
                          </div>
                        </div>
                        <span className={`text-lg font-bold ${
                          area.score >= 75 ? "text-livemed-success" : 
                          area.score >= 60 ? "text-livemed-warning" : "text-destructive"
                        }`}>
                          {area.score}%
                        </span>
                      </div>
                      <Progress value={area.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Actions to improve your residency readiness score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={rec.href}>{rec.action}</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Milestones to Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${
                        milestone.completed ? "opacity-60" : ""
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.completed
                          ? "bg-livemed-success text-white"
                          : milestone.current
                          ? "border-2 border-accent"
                          : "border border-muted-foreground"
                      }`}>
                        {milestone.completed && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${milestone.completed ? "line-through" : "font-medium"}`}>
                          {milestone.title}
                        </p>
                        {milestone.progress !== undefined && !milestone.completed && (
                          <div className="mt-1">
                            <Progress value={milestone.progress} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-1">{milestone.progress}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time to Match */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gradient-livemed mb-1">8 months</div>
                  <p className="text-sm text-muted-foreground mb-4">Until ERAS Opens</p>
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">USMLE Step 2 CK</span>
                      <span>Not Scheduled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LORs Collected</span>
                      <span>0 / 4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Personal Statement</span>
                      <span>Not Started</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="gradient-livemed text-white">
              <CardContent className="p-6">
                <Stethoscope className="h-8 w-8 mb-4 opacity-80" />
                <h3 className="font-semibold text-lg mb-2">
                  Boost Your Score
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  Complete a virtual rotation to get a faculty evaluation and LOR.
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/rotation-experience">Start Rotation</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Residency;
