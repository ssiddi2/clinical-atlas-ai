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
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

const Dashboard = () => {
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

  const quickActions = [
    { icon: MessageSquare, label: "Ask ATLAS™", href: "/atlas", color: "bg-accent" },
    { icon: BookOpen, label: "Continue Learning", href: "/curriculum", color: "bg-primary" },
    { icon: Stethoscope, label: "Virtual Rotation", href: "/rotation-experience", color: "bg-livemed-success" },
    { icon: FileText, label: "Take Assessment", href: "/assessments", color: "bg-livemed-warning" },
  ];

  const upcomingItems = [
    { title: "Cardiology Module Review", time: "Today, 2:00 PM", type: "Study" },
    { title: "Internal Medicine Rotation", time: "Tomorrow, 9:00 AM", type: "Rotation" },
    { title: "Live Case Conference", time: "Thu, 4:00 PM", type: "Live" },
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
            <img src={livemedLogo} alt="LIVEMED" style={{ height: '80px', width: 'auto' }} className="object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/curriculum" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Curriculum
            </Link>
            <Link to="/atlas" className="text-sm font-medium text-muted-foreground hover:text-primary">
              ATLAS™
            </Link>
            <Link to="/rotations" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Rotations
            </Link>
            <Link to="/assessments" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Assessments
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Card className="hover:shadow-livemed transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
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
                    <div
                      key={idx}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                        <span className="inline-block mt-1 text-xs bg-muted px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Residency Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Residency Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gradient-livemed mb-1">72%</div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinical Knowledge</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinical Reasoning</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Communication</span>
                    <span className="font-medium">68%</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/residency">View Full Report</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Virtual Rotations */}
            <Card className="gradient-livemed text-white">
              <CardContent className="p-6">
                <Stethoscope className="h-8 w-8 mb-4 opacity-80" />
                <h3 className="font-semibold text-lg mb-2">
                  Start a Virtual Rotation
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  Experience U.S. clinical training with real case discussions and faculty evaluations.
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/rotations">Browse Rotations</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
