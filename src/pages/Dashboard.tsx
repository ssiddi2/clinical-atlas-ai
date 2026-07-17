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
  ClipboardCheck, Sparkles, Video, GraduationCap, ChevronRight, ChevronDown,
  CalendarCheck,
} from "lucide-react";
import livemedLogoAsset from "@/assets/livemed-logo-light.png.asset.json";
const livemedLogo = livemedLogoAsset.url;
import NotificationBell from "@/components/notifications/NotificationBell";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import StudyPlanWidget from "@/components/dashboard/StudyPlanWidget";
import { MatchReadyWidget } from "@/components/score/MatchReadyWidget";
import { useScorePredictor } from "@/hooks/useScorePredictor";
import { useTranslation } from "@/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileData {
  onboarding_completed: boolean;
  verification_status: string | null;
  weak_areas: string[] | null;
  learning_assessment_completed?: boolean;
}

interface UpcomingLecture {
  id: string;
  title: string;
  scheduled_start: string;
  status: string;
}

interface CourseProgress {
  courseTitle: string;
  totalTopics: number;
  completedTopics: number;
  progress: number;
}

interface ContinueLearningData {
  courseTitle: string;
  topicTitle: string;
  courseId: string;
  topicId: string;
  progress: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [upcomingLectures, setUpcomingLectures] = useState<UpcomingLecture[]>([]);
  const [courseProgressData, setCourseProgressData] = useState<CourseProgress[]>([]);
  const [continueLearning, setContinueLearning] = useState<ContinueLearningData | null>(null);

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
    // Fetch profile, admin check, and enrolled course IDs
    const [profileRes, adminRes, courseEnrollRes] = await Promise.all([
      supabase.from("profiles").select("onboarding_completed, verification_status, weak_areas, learning_assessment_completed").eq("user_id", userId).maybeSingle(),
      supabase.rpc("has_role", { _user_id: userId, _role: "platform_admin" }),
      supabase.from("course_enrollments").select("course_id").eq("student_id", userId).eq("status", "approved"),
    ]);
    setProfile(profileRes.data);
    setIsAdmin(!!adminRes.data);

    // Nudge students who finished onboarding but haven't taken the learning assessment.
    if (profileRes.data?.onboarding_completed && !profileRes.data?.learning_assessment_completed && !adminRes.data) {
      navigate("/learning-assessment");
      return;
    }

    const enrolledCourseIds = courseEnrollRes.data?.map((e: any) => e.course_id) || [];

    if (enrolledCourseIds.length > 0) {
      // Fetch upcoming lectures, courses, topics, and progress in parallel
      const [lecturesRes, coursesRes, topicsRes, progressRes] = await Promise.all([
        supabase.from("virtual_classrooms")
          .select("id, title, scheduled_start, status")
          .in("course_id", enrolledCourseIds)
          .in("status", ["scheduled", "live"])
          .order("scheduled_start", { ascending: true })
          .limit(3),
        supabase.from("courses").select("id, title").in("id", enrolledCourseIds),
        supabase.from("course_topics").select("id, course_id, title, parent_topic_id").in("course_id", enrolledCourseIds),
        supabase.from("learning_unit_progress").select("topic_id, completed, updated_at").eq("student_id", userId),
      ]);

      // Upcoming lectures
      if (lecturesRes.data) {
        setUpcomingLectures(lecturesRes.data);
      }

      // Course progress calculation
      const courses = coursesRes.data || [];
      const topics = topicsRes.data || [];
      const progressRecords = progressRes.data || [];
      const completedTopicIds = new Set(progressRecords.filter((p: any) => p.completed).map((p: any) => p.topic_id));

      const progressList: CourseProgress[] = courses.map((course: any) => {
        // Leaf topics (subtopics) for this course
        const courseTopics = topics.filter((t: any) => t.course_id === course.id);
        const parentIds = new Set(courseTopics.filter((t: any) => t.parent_topic_id === null).map((t: any) => t.id));
        const leafTopics = courseTopics.filter((t: any) => t.parent_topic_id !== null);
        const total = leafTopics.length || 1;
        const completed = leafTopics.filter((t: any) => completedTopicIds.has(t.id)).length;
        return {
          courseTitle: course.title,
          totalTopics: total,
          completedTopics: completed,
          progress: Math.round((completed / total) * 100),
        };
      });
      setCourseProgressData(progressList);

      // Continue learning: find most recent incomplete progress
      const incompleteProgress = progressRecords
        .filter((p: any) => !p.completed)
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      if (incompleteProgress.length > 0) {
        const recentTopicId = incompleteProgress[0].topic_id;
        const topic = topics.find((t: any) => t.id === recentTopicId);
        if (topic) {
          const course = courses.find((c: any) => c.id === topic.course_id);
          setContinueLearning({
            courseTitle: course?.title || "Course",
            topicTitle: topic.title,
            courseId: topic.course_id,
            topicId: topic.id,
            progress: 50, // approximate
          });
        }
      } else if (courses.length > 0) {
        // No progress yet — suggest first course's first topic
        const firstCourse = courses[0];
        const firstTopic = topics.find((t: any) => t.course_id === firstCourse.id && t.parent_topic_id !== null);
        if (firstTopic) {
          setContinueLearning({
            courseTitle: firstCourse.title,
            topicTitle: firstTopic.title,
            courseId: firstCourse.id,
            topicId: firstTopic.id,
            progress: 0,
          });
        }
      }
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
    { icon: MessageSquare, label: t("dashboard.askAtlas"), href: "/atlas", color: "bg-blue-500" },
    { icon: GraduationCap, label: t("courses.myCourses") || "My Courses", href: "/courses", color: "bg-violet-500" },
    { icon: Video, label: t("dashboard.virtualClassroom"), href: "/virtual-classroom", color: "bg-emerald-500" },
    { icon: BookOpen, label: t("dashboard.curriculum"), href: "/curriculum", color: "bg-amber-500" },
    { icon: Stethoscope, label: t("dashboard.liveRounds"), href: "/virtual-rounds", color: "bg-rose-500" },
    { icon: FileText, label: t("dashboard.takeAssessment"), href: "/assessments", color: "bg-orange-500" },
  ];

  const upcomingItems = upcomingLectures.length > 0
    ? upcomingLectures.map(l => ({
        title: l.title,
        time: new Date(l.scheduled_start).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        type: l.status === "live" ? t("common.live") : "Lecture",
        href: "/virtual-classroom",
      }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center">
              <img src={livemedLogo} alt="Livemed Academy" className="h-8 object-contain" />
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              <Link to="/curriculum" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("dashboard.curriculum")}</Link>
              <Link to="/atlas" className="text-sm font-medium text-muted-foreground hover:text-primary">ATLAS™</Link>
            </nav>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {[
              { icon: GraduationCap, label: t("courses.myCourses") || "My Courses", href: "/courses" },
              { icon: Video, label: t("dashboard.virtualClassroom"), href: "/virtual-classroom" },
              { icon: Stethoscope, label: t("dashboard.liveRounds"), href: "/virtual-rounds" },
              { icon: FileText, label: t("footer.assessments"), href: "/assessments" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="group flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-primary">
                <ShieldCheck className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">{t("dashboard.admin")}</span>
              </Button>
            )}
            <NotificationBell userId={user?.id || null} />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs font-semibold">
                      {firstName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{firstName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <Settings className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <VerificationBanner 
          status={profile?.verification_status as 'pending' | 'verified' | 'rejected' | null}
          onboardingCompleted={profile?.onboarding_completed || false}
        />

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            {t("dashboard.welcomeBack").replace("{name}", firstName)} <span aria-hidden>👋</span>
          </h1>
          <p className="text-muted-foreground">{t("dashboard.continueJourney")}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Card className="hover:shadow-livemed transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-sm leading-tight flex-1">{action.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                {continueLearning ? (
                  <Link to={`/courses/${continueLearning.courseId}/topic/${continueLearning.topicId}`} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="w-16 h-16 rounded-lg gradient-livemed flex items-center justify-center flex-shrink-0">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{continueLearning.courseTitle}: {continueLearning.topicTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-2">In progress</p>
                      <Progress value={continueLearning.progress} className="h-2" />
                    </div>
                    <Button className="gradient-livemed flex-shrink-0">{t("dashboard.resume")}</Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">No courses enrolled yet. Contact your admin to get enrolled in a course.</p>
                    </div>
                  </div>
                )}
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
                {courseProgressData.length > 0 ? (
                  <div className="space-y-4">
                    {courseProgressData.map((item) => (
                      <div key={item.courseTitle} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.courseTitle}</span>
                          <span className="text-muted-foreground">
                            {item.progress}% ({item.completedTopics}/{item.totalTopics} topics)
                          </span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No course progress yet. Enroll in a course to start tracking your progress.</p>
                )}
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
                {upcomingItems.length > 0 ? (
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
                ) : (
                  <p className="text-muted-foreground text-sm">No upcoming sessions</p>
                )}
              </CardContent>
            </Card>

            <StudyPlanWidget userId={user?.id || null} />

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
