import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Search, GraduationCap } from "lucide-react";
import CourseCard from "@/components/courses/CourseCard";
import { useTranslation } from "@/i18n/LanguageContext";
import AppShell from "@/components/layout/AppShell";

const Courses = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, string>>({});
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    // First get the student's approved enrollments
    const { data: enrollData } = await supabase
      .from("course_enrollments")
      .select("course_id, status")
      .eq("student_id", user.id)
      .eq("status", "approved");

    if (!enrollData || enrollData.length === 0) {
      setCourses([]);
      setEnrollments({});
      setEnrollmentCounts({});
      setLoading(false);
      return;
    }

    const enrolledCourseIds = enrollData.map(e => e.course_id);
    const enrollMap: Record<string, string> = {};
    enrollData.forEach((e: any) => { enrollMap[e.course_id] = e.status; });
    setEnrollments(enrollMap);

    // Fetch only enrolled courses
    const [coursesRes, countsRes] = await Promise.all([
      supabase.from("courses").select("*, specialties(name)").in("id", enrolledCourseIds).order("created_at", { ascending: false }),
      supabase.from("course_enrollments").select("course_id").eq("status", "approved").in("course_id", enrolledCourseIds),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (countsRes.data) {
      const counts: Record<string, number> = {};
      countsRes.data.forEach((e: any) => { counts[e.course_id] = (counts[e.course_id] || 0) + 1; });
      setEnrollmentCounts(counts);
    }
    setLoading(false);
  };

  const filtered = courses.filter(c => {
    return !search || c.title.toLowerCase().includes(search.toLowerCase());
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
              <GraduationCap className="h-6 w-6 text-primary" />
              {t("courses.myCourses") || "My Courses"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("courses.myCoursesSubtitle") || "Courses you are enrolled in"}</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("courses.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-card/50 border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t("courses.noEnrolledCourses") || "You are not enrolled in any courses yet. Contact your admin to get enrolled."}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                enrollmentStatus={enrollments[course.id] || null}
                enrollmentCount={enrollmentCounts[course.id] || 0}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Courses;
