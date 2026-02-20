import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Brain,
  Stethoscope,
  Award,
  TrendingUp,
  Calendar,
  MessageSquare,
  PlayCircle,
  FileText,
  LogOut,
  Settings,
  Bell,
  ShieldCheck,
  Target,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import { MatchReadyWidget } from "@/components/score/MatchReadyWidget";
import { useScorePredictor } from "@/hooks/useScorePredictor";

interface ProfileData {
  onboarding_completed: boolean;
  verification_status: string | null;
  weak_areas: string[] | null;
}

interface DashboardState {
  profile: ProfileData | null;
  isAdmin: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfileAndCheckAdmin(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfileAndCheckAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfileAndCheckAdmin = async (userId: string) => {
    // Load profile
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed, verification_status, weak_areas")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);

    // Check admin role
    const { data: hasRole } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "platform_admin",
    });
    setIsAdmin(!!hasRole);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name || "Student";

  const hasTakenDiagnostic = profile?.weak_areas && profile.weak_areas.length > 0;

  const quickActions = [
    { icon: MessageSquare, label: "Ask ATLAS™", href: "/atlas", color: "bg-accent" },
    { icon: BookOpen, label: "Continue Learning", href: "/curriculum", color: "bg-primary" },
    { icon: Stethoscope, label: "Live Rounds", href: "/virtual-rounds", color: "bg-livemed-success" },
    { icon: FileText, label: "Take Assessment", href: "/assessments", color: "bg-livemed-warning" },
  ];

  const upcomingItems = [
    { title: "Cardiology Module Review", time: "Today, 2:00 PM", type: "Study", href: "/curriculum" },
    { title: "Live Rounds: Internal Medicine", time: "Tomorrow, 9:00 AM", type: "Live", href: "/virtual-rounds" },
    { title: "Live Case Conference", time: "Thu, 4:00 PM", type: "Live", href: "/virtual-rounds" },
  ];

  const progressData = [
    { subject: "Cardiology", progress: 78, total: 24 },
    { subject: "Pulmonology", progress: 65, total: 20 },
    { subject: "Neurology", progress: 42, total: 28 },
    { subject: "GI", progress: 90, total: 18 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={livemedLogo} alt="Livemed" className="h-10 md:h-16 object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/curriculum" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Curriculum
            </Link>
            <Link to="/atlas" className="text-sm font-medium text-muted-foreground hover:text-primary">
              ATLAS™
            </Link>
            <Link to="/virtual-rounds" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Live Rounds
            </Link>
            <Link to="/assessments" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Assessments
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-primary">
                <ShieldCheck className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Verification Banner */}
        <VerificationBanner 
          status={profile?.verification_status as 'pending' | 'verified' | 'rejected' | null}
          onboardingCompleted={profile?.onboarding_completed || false}
        />

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Continue your medical education journey. You're making great progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Card className="hover:shadow-livemed transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="font-medium text-xs md:text-sm">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Diagnostic Assessment Promotion */}
            {!hasTakenDiagnostic && (
              <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full" />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg gradient-livemed flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Take Your Diagnostic Assessment</CardTitle>
                        <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">Recommended</span>
                      </div>
                      <CardDescription>Personalize your learning journey</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete a 20-question diagnostic to identify your strengths and weaknesses. 
                    We'll create a personalized study plan to maximize your USMLE preparation efficiency.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button className="gradient-livemed" asChild>
                      <Link to="/diagnostic">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Start Diagnostic
                      </Link>
                    </Button>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        ~40 minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Personalized plan
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Continue Learning Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Continue Where You Left Off
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg gradient-livemed flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">Cardiology: Heart Failure Management</h3>
                    <p className="text-sm text-muted-foreground mb-2">Module 12 of 24 • 35 min remaining</p>
                    <Progress value={50} className="h-2" />
                  </div>
                  <Button className="gradient-livemed flex-shrink-0">
                    Resume
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Your Progress
                </CardTitle>
                <CardDescription>Competency by organ system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.map((item) => (
                    <div key={item.subject} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-muted-foreground">
                          {item.progress}% ({Math.round(item.total * item.progress / 100)}/{item.total} modules)
                        </span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ATLAS Chat Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  Ask ATLAS™
                </CardTitle>
                <CardDescription>Your AI Professor is ready to help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground italic">
                    "I noticed you're studying heart failure. Would you like me to explain the 
                    pathophysiology of HFrEF vs HFpEF, or should we review the treatment algorithm?"
                  </p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/atlas">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start a Conversation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.href}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0 hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.type === 'Live' ? 'bg-livemed-success animate-pulse' : 'bg-accent'}`} />
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${item.type === 'Live' ? 'bg-livemed-success/20 text-livemed-success' : 'bg-muted'}`}>
                          {item.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MATCH Ready Score Predictor */}
            <MatchReadyWidgetWrapper userId={user?.id || null} />

            {/* Live Virtual Rounds */}
            <Card className="gradient-livemed text-white">
              <CardContent className="p-6">
                <Stethoscope className="h-8 w-8 mb-4 opacity-80" />
                <h3 className="font-semibold text-lg mb-2">
                  Join Live Rounds
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  Shadow US physicians during real telemedicine rounds at hospitals.
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/virtual-rounds">View Sessions</Link>
                </Button>
                <Button variant="ghost" className="w-full mt-2 text-white/80 hover:text-white hover:bg-white/10" asChild>
                  <Link to="/rotation-experience">Practice Cases</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Wrapper component for MATCH Ready widget
const MatchReadyWidgetWrapper = ({ userId }: { userId: string | null }) => {
  const { prediction, loading, insufficientData, totalQuestionsAnswered, confidenceLevel } = useScorePredictor(userId);
  
  return (
    <MatchReadyWidget
      score={prediction?.predictedStep1Score || 225}
      passProbability={prediction?.passProbabilityStep1 || 85}
      percentile={prediction?.percentile || 68}
      trend={prediction?.trend || 'stable'}
      trendValue={prediction?.trendValue || 0}
      loading={loading}
      insufficientData={insufficientData}
      totalQuestionsAnswered={totalQuestionsAnswered}
      confidenceLevel={confidenceLevel}
    />
  );
};

export default Dashboard;
