import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Video, BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LectureCard from "@/components/classroom/LectureCard";
import { useTranslation } from "@/i18n/LanguageContext";
import AppShell from "@/components/layout/AppShell";

const VirtualClassroom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");
  const highlightId = searchParams.get("lectureId");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      const redirect = `/virtual-classroom${window.location.search}`;
      navigate(`/auth?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    // Get student's approved course enrollments
    const { data: courseEnrollData } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", user.id)
      .eq("status", "approved");

    const enrolledCourseIds = courseEnrollData?.map(e => e.course_id) || [];

    // Get classrooms only for enrolled courses
    let classRes;
    if (enrolledCourseIds.length > 0) {
      classRes = await supabase
        .from("virtual_classrooms")
        .select("*")
        .in("course_id", enrolledCourseIds)
        .order("scheduled_start", { ascending: true });
    }

    // Also get classroom enrollments for this student
    const { data: classEnrollData } = await supabase
      .from("classroom_enrollments")
      .select("classroom_id")
      .eq("student_id", user.id);

    if (classRes?.data) setClassrooms(classRes.data);
    else setClassrooms([]);
    if (classEnrollData) setEnrollments(new Set(classEnrollData.map(e => e.classroom_id)));
    setLoading(false);
  };

  useEffect(() => {
    if (!highlightId || loading || classrooms.length === 0) return;
    const target = classrooms.find(c => c.id === highlightId);
    if (!target) return;
    if (target.status === "live") setTab("live");
    else if (target.status === "scheduled") setTab("upcoming");
    else setTab("all");
    setTimeout(() => {
      const el = document.getElementById(`lecture-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "ring-offset-2", "rounded-lg");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-lg");
        }, 3000);
      }
    }, 200);
  }, [highlightId, loading, classrooms]);

  const filtered = classrooms.filter(c => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    if (tab === "enrolled") return matchesSearch && enrollments.has(c.id);
    if (tab === "upcoming") return matchesSearch && c.status === "scheduled";
    if (tab === "live") return matchesSearch && c.status === "live";
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              {t("classroom.title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("classroom.subtitle")}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("classroom.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming">{t("classroom.upcoming")}</TabsTrigger>
            <TabsTrigger value="live">
              <div className="flex items-center gap-1.5">
                {classrooms.some(c => c.status === "live") && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                {t("classroom.live")}
              </div>
            </TabsTrigger>
            <TabsTrigger value="enrolled">{t("classroom.myLectures")}</TabsTrigger>
            <TabsTrigger value="all">{t("classroom.allLectures")}</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {filtered.length === 0 ? (
              <Card className="bg-card/50 border-border/30">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">{t("classroom.noLectures")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map(lecture => (
                  <div key={lecture.id} id={`lecture-${lecture.id}`} className="transition-all">
                    <LectureCard
                      lecture={lecture}
                      isEnrolled={enrollments.has(lecture.id)}
                      onRefresh={loadData}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default VirtualClassroom;
