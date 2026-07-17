import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Stethoscope, Calendar, MessageSquare,
  PlayCircle, FileText, Target,
  ClipboardCheck, Video, GraduationCap, ChevronRight,
  CalendarCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import StudyPlanWidget from "@/components/dashboard/StudyPlanWidget";
import LearningJourney from "@/components/dashboard/LearningJourney";
import { MatchReadyWidget } from "@/components/score/MatchReadyWidget";
import { useScorePredictor } from "@/hooks/useScorePredictor";
import { useTranslation } from "@/i18n";

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
    <AppShell>
      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
        <VerificationBanner 
          status={profile?.verification_status as 'pending' | 'verified' | 'rejected' | null}
          onboardingCompleted={profile?.onboarding_completed || false}
        />

        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {t("dashboard.welcomeBack").replace("{name}", firstName)} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">{t("dashboard.continueJourney")}</p>
        </div>

        {/* Quick Actions */}
        <section aria-label="Quick actions">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={action.label}
              >
                <Card className="h-full rounded-2xl border-border/70 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 group-hover:-translate-y-0.5">
                  <CardContent className="p-4 flex items-center gap-3.5">
                    <div data-brand-surface className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <action.icon className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <span className="font-semibold text-[14px] leading-tight flex-1 text-foreground">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="space-y-6 min-w-0">
            {/* Diagnostic Assessment Promotion */}
            {!hasTakenDiagnostic && (
              <Card className="relative overflow-hidden rounded-2xl border-primary/15 shadow-md bg-gradient-to-br from-primary/[0.06] via-background to-background">
                <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
                <CardContent className="relative p-6 md:p-8 flex items-start gap-6">
                  <div className="flex-1 min-w-0 max-w-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm ring-4 ring-primary/10">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl md:text-[22px] font-bold tracking-tight text-foreground">{t("dashboard.diagnostic.title")}</h2>
                          <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-full">{t("dashboard.diagnostic.recommended")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{t("dashboard.diagnostic.personalize")}</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-foreground/75 mb-6 leading-relaxed max-w-xl">{t("dashboard.diagnostic.description")}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-sm h-11 px-6 text-[14px] font-semibold" asChild>
                        <Link to="/diagnostic">
                          {t("dashboard.diagnostic.start")}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <div className="flex items-center gap-5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden />{t("dashboard.diagnostic.duration")}</span>
                        <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" aria-hidden />{t("dashboard.diagnostic.personalizedPlan")}</span>
                      </div>
                    </div>
                  </div>
                  <div aria-hidden className="hidden md:flex w-44 h-44 rounded-2xl bg-gradient-to-br from-primary to-primary/70 items-center justify-center flex-shrink-0 relative shadow-lg shadow-primary/20">
                    <ClipboardCheck className="h-20 w-20 text-white" strokeWidth={1.5} />
                    <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-emerald-500 shadow-md flex items-center justify-center ring-2 ring-background">
                      <Target className="h-6 w-6 text-white" strokeWidth={2.25} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Continue Learning Card */}
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <span className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                    <BookOpen className="h-[18px] w-[18px]" />
                  </span>
                  {t("dashboard.continueWhereLeft")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {continueLearning ? (
                  <Link
                    to={`/courses/${continueLearning.courseId}/topic/${continueLearning.topicId}`}
                    className="flex items-center gap-4 p-4 bg-muted/40 hover:bg-muted/60 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="w-14 h-14 rounded-xl gradient-livemed flex items-center justify-center flex-shrink-0 shadow-sm">
                      <PlayCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{continueLearning.courseTitle}: {continueLearning.topicTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">In progress · {continueLearning.progress}%</p>
                      <Progress value={continueLearning.progress} className="h-2" />
                    </div>
                    <Button className="gradient-livemed flex-shrink-0">{t("dashboard.resume")}</Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="w-12 h-12 rounded-xl bg-slate-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">No courses enrolled yet</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Contact your admin to get enrolled in a course.</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="border-primary/40 text-primary hover:bg-primary/5 hover:text-primary flex-shrink-0">
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/70 shadow-sm min-h-[220px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                    <span className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-sm">
                      <Calendar className="h-[18px] w-[18px]" />
                    </span>
                    {t("dashboard.upcoming")}
                  </CardTitle>
                  <Link
                    to="/virtual-classroom"
                    className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {upcomingItems.length > 0 ? (
                  <ul className="space-y-1 -mx-2">
                    {upcomingItems.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          to={item.href}
                          className="flex items-start gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.type === t("common.live") ? 'bg-livemed-success animate-pulse' : 'bg-accent'}`} aria-hidden />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                            <span className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded ${item.type === t("common.live") ? 'bg-livemed-success/15 text-livemed-success' : 'bg-muted text-foreground/70'}`}>{item.type}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-3 shadow-sm">
                      <CalendarCheck className="h-8 w-8 text-white" strokeWidth={1.5} aria-hidden />
                    </div>
                    <p className="font-semibold text-sm text-foreground">No upcoming sessions</p>
                    <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <MatchReadyWidgetWrapper userId={user?.id || null} />
          </div>
        </div>

        {/* Learning Journey — full width below main grid */}
        <div className="space-y-6">
          <LearningJourney userId={user?.id || null} />
          <StudyPlanWidget userId={user?.id || null} />
        </div>
      </main>
    </AppShell>
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
