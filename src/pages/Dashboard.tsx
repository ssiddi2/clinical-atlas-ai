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
import LearningJourney from "@/components/dashboard/LearningJourney";
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
            {t("dashboard.welcomeBack").replace("{name}", firstName)} <span aria-hidden>👋</span>
          </h1>
          <p className="text-muted-foreground">{t("dashboard.continueJourney")}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Card className="hover:shadow-livemed transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full rounded-2xl">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-[15px] leading-tight flex-1">{action.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Diagnostic Assessment Promotion */}
            {!hasTakenDiagnostic && (
              <Card className="overflow-hidden">
                <CardContent className="p-6 flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold">{t("dashboard.diagnostic.title")}</h3>
                          <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">{t("dashboard.diagnostic.recommended")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{t("dashboard.diagnostic.personalize")}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{t("dashboard.diagnostic.description")}</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button className="bg-primary hover:bg-primary/90" asChild>
                        <Link to="/diagnostic">
                          {t("dashboard.diagnostic.start")}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />{t("dashboard.diagnostic.duration")}</span>
                        <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" />{t("dashboard.diagnostic.personalizedPlan")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex w-44 h-44 rounded-2xl bg-primary/5 items-center justify-center flex-shrink-0 relative">
                    <ClipboardCheck className="h-20 w-20 text-primary" strokeWidth={1.5} />
                    <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                      <Target className="h-8 w-8 text-primary" strokeWidth={2} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Continue Learning Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
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
                  <div className="flex items-center gap-4 p-5 bg-muted/40 rounded-xl">
                    <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-0.5">No courses enrolled yet.</p>
                      <p className="text-muted-foreground text-sm">Contact your admin to get enrolled in a course.</p>
                    </div>
                    <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/5 hover:text-primary">
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("dashboard.upcoming")}
                  </CardTitle>
                  <Link to="/virtual-classroom" className="text-xs font-medium text-primary hover:underline">View All</Link>
                </div>
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
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-3">
                      <CalendarCheck className="h-10 w-10 text-primary/60" strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-sm">No upcoming sessions</p>
                    <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <MatchReadyWidgetWrapper userId={user?.id || null} />
          </div>
        </div>

        {/* Learning Journey — full width below main grid */}
        <div className="mt-8 space-y-6">
          <LearningJourney userId={user?.id || null} />
          <StudyPlanWidget userId={user?.id || null} />
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
