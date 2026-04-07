import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut, Plus, Video, Users, Calendar, BookOpen, Clock, CheckCircle2,
  Play, Settings, Bell,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";
import CreateLectureModal from "@/components/classroom/CreateLectureModal";
import LectureCard from "@/components/classroom/LectureCard";
import { useTranslation } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const PhysicianDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
      else loadData(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
      else loadData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    const [profileRes, lecturesRes] = await Promise.all([
      supabase.from("profiles").select("first_name, last_name").eq("user_id", userId).single(),
      supabase.from("virtual_classrooms").select("*").eq("instructor_id", userId).order("scheduled_start", { ascending: true }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (lecturesRes.data) setLectures(lecturesRes.data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleLectureCreated = () => {
    if (user) loadData(user.id);
    setShowCreateModal(false);
    toast({ title: t("classroom.lectureCreated"), description: t("classroom.lectureCreatedDesc") });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = lectures.filter(l => l.status === "scheduled");
  const live = lectures.filter(l => l.status === "live");
  const completed = lectures.filter(l => l.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={livemedLogo} alt="Livemed" className="h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> {t("dashboard.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("physician.welcome")}, Dr. {profile?.last_name || ""}
            </h1>
            <p className="text-muted-foreground mt-1">{t("physician.dashboardSubtitle")}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gradient-livemed">
            <Plus className="h-4 w-4 mr-2" /> {t("classroom.createLecture")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: t("physician.upcoming"), value: upcoming.length, color: "text-blue-400" },
            { icon: Play, label: t("physician.liveNow"), value: live.length, color: "text-green-400" },
            { icon: CheckCircle2, label: t("physician.completed"), value: completed.length, color: "text-muted-foreground" },
            { icon: Users, label: t("physician.totalStudents"), value: lectures.reduce((a, l) => a + (l.max_students || 0), 0), color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/50 border-border/30">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Now */}
        {live.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t("physician.liveNow")}
            </h2>
            <div className="grid gap-4">
              {live.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} isInstructor onRefresh={() => user && loadData(user.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" /> {t("physician.upcomingLectures")}
          </h2>
          {upcoming.length === 0 ? (
            <Card className="bg-card/50 border-border/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Video className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">{t("physician.noUpcoming")}</p>
                <Button onClick={() => setShowCreateModal(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> {t("classroom.createLecture")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} isInstructor onRefresh={() => user && loadData(user.id)} />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> {t("physician.completedLectures")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completed.slice(0, 4).map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} isInstructor onRefresh={() => user && loadData(user.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">{t("physician.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setShowCreateModal(true)}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="p-3 rounded-xl bg-primary/10 text-primary"><Video className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium text-foreground">{t("classroom.scheduleLecture")}</p>
                  <p className="text-sm text-muted-foreground">{t("classroom.scheduleLectureDesc")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/virtual-rounds")}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="p-3 rounded-xl bg-accent/10 text-accent"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium text-foreground">{t("physician.virtualRounds")}</p>
                  <p className="text-sm text-muted-foreground">{t("physician.virtualRoundsDesc")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium text-foreground">{t("physician.writeLOR")}</p>
                  <p className="text-sm text-muted-foreground">{t("physician.writeLORDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <CreateLectureModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={handleLectureCreated}
      />
    </div>
  );
};

export default PhysicianDashboard;
