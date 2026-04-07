import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Brain, Stethoscope, Award, TrendingUp, Calendar, MessageSquare,
  PlayCircle, FileText, LogOut, Settings, Bell, ShieldCheck, Target,
  ClipboardCheck, Sparkles, Video,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import { MatchReadyWidget } from "@/components/score/MatchReadyWidget";
import { useScorePredictor } from "@/hooks/useScorePredictor";
import { useTranslation } from "@/i18n";

interface ProfileData {
  onboarding_completed: boolean;
  verification_status: string | null;
  weak_areas: string[] | null;
}

interface UpcomingLecture {
  id: string;
  title: string;
  scheduled_start: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [upcomingLectures, setUpcomingLectures] = useState<UpcomingLecture[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
      else loadProfileAndCheckAdmin(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
      else loadProfileAndCheckAdmin(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfileAndCheckAdmin = async (userId: string) => {
    const [profileRes, adminRes, enrollmentsRes] = await Promise.all([
      supabase.from("profiles").select("onboarding_completed, verification_status, weak_areas").eq("user_id", userId).maybeSingle(),
      supabase.rpc("has_role", { _user_id: userId, _role: "platform_admin" }),
      supabase.from("classroom_enrollments").select("classroom_id, virtual_classrooms(id, title, scheduled_start, status)").eq("student_id", userId),
    ]);
    setProfile(profileRes.data);
    setIsAdmin(!!adminRes.data);

    if (enrollmentsRes.data) {
      const lectures = enrollmentsRes.data
        .map((e: any) => e.virtual_classrooms)
        .filter((vc: any) => vc && (vc.status === "scheduled" || vc.status === "live"))
        .sort((a: any, b: any) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
        .slice(0, 3);
      setUpcomingLectures(lectures);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name || "Student";
  const hasTakenDiagnostic = profile?.weak_areas && profile.weak_areas.length > 0;

  const quickActions = [
    { icon: MessageSquare, label: t("dashboard.askAtlas"), href: "/atlas", color: "bg-accent" },
    { icon: BookOpen, label: t("dashboard.continueLearning"), href: "/curriculum", color: "bg-primary" },
    { icon: Video, label: t("dashboard.virtualClassroom"), href: "/virtual-classroom", color: "bg-livemed-purple" },
    { icon: Stethoscope, label: t("dashboard.liveRounds"), href: "/virtual-rounds", color: "bg-livemed-success" },
    { icon: FileText, label: t("dashboard.takeAssessment"), href: "/assessments", color: "bg-livemed-warning" },
  ];

  const upcomingItems = upcomingLectures.length > 0
    ? upcomingLectures.map(l => ({
        title: l.title,
        time: new Date(l.scheduled_start).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        type: l.status === "live" ? t("common.live") : "Lecture",
        href: "/virtual-classroom",
      }))
    : [
        { title: "Cardiology Module Review", time: "Today, 2:00 PM", type: "Study", href: "/curriculum" },
        { title: "Live Rounds: Internal Medicine", time: "Tomorrow, 9:00 AM", type: t("common.live"), href: "/virtual-rounds" },
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
            <Link to="/curriculum" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("dashboard.curriculum")}</Link>
            <Link to="/atlas" className="text-sm font-medium text-muted-foreground hover:text-primary">ATLAS™</Link>
            <Link to="/virtual-classroom" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("dashboard.virtualClassroom")}</Link>
            <Link to="/virtual-rounds" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("dashboard.liveRounds")}</Link>
            <Link to="/assessments" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("footer.assessments")}</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-primary">
                <ShieldCheck className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">{t("dashboard.admin")}</span>
              </Button>
            )}
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <VerificationBanner 
          status={profile?.verification_status as 'pending' | 'verified' | 'rejected' | null}
          onboardingCompleted={profile?.onboarding_completed || false}
        />

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("dashboard.welcomeBack").replace("{name}", firstName)}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.continueJourney")}</p>
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
                        <CardTitle className="text-lg">{t("dashboard.diagnostic.title")}</CardTitle>
                        <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">{t("dashboard.diagnostic.recommended")}</span>
                      </div>
                      <CardDescription>{t("dashboard.diagnostic.personalize")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{t("dashboard.diagnostic.description")}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button className="gradient-livemed" asChild>
                      <Link to="/diagnostic">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        {t("dashboard.diagnostic.start")}
                      </Link>
                    </Button>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />{t("dashboard.diagnostic.duration")}</span>
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" />{t("dashboard.diagnostic.personalizedPlan")}</span>
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
                  {t("dashboard.continueWhereLeft")}
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
                  <Button className="gradient-livemed flex-shrink-0">{t("dashboard.resume")}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  {t("dashboard.yourProgress")}
                </CardTitle>
                <CardDescription>{t("dashboard.competencyBySystem")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.map((item) => (
                    <div key={item.subject} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-muted-foreground">
                          {item.progress}% ({Math.round(item.total * item.progress / 100)}/{item.total} {t("curriculum.modules")})
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
                  {t("dashboard.askAtlasTitle")}
                </CardTitle>
                <CardDescription>{t("dashboard.aiReady")}</CardDescription>
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
                    {t("dashboard.startConversation")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  {t("dashboard.upcoming")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingItems.map((item, idx) => (
                    <Link key={idx} to={item.href} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0 hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.type === t("common.live") ? 'bg-livemed-success animate-pulse' : 'bg-accent'}`} />
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${item.type === t("common.live") ? 'bg-livemed-success/20 text-livemed-success' : 'bg-muted'}`}>{item.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <MatchReadyWidgetWrapper userId={user?.id || null} />

            <Card className="gradient-livemed text-white">
              <CardContent className="p-6">
                <Stethoscope className="h-8 w-8 mb-4 opacity-80" />
                <h3 className="font-semibold text-lg mb-2">{t("dashboard.joinLiveRounds")}</h3>
                <p className="text-sm text-white/80 mb-4">{t("dashboard.joinLiveRoundsDesc")}</p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/virtual-rounds">{t("dashboard.viewSessions")}</Link>
                </Button>
                <Button variant="ghost" className="w-full mt-2 text-white/80 hover:text-white hover:bg-white/10" asChild>
                  <Link to="/rotation-experience">{t("dashboard.practiceCases")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

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
