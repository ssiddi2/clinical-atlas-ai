import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Search, GraduationCap } from "lucide-react";
import CourseCard from "@/components/courses/CourseCard";
import { useTranslation } from "@/i18n/LanguageContext";

const Courses = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, string>>({});
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const [coursesRes, enrollRes, specRes, countsRes] = await Promise.all([
      supabase.from("courses").select("*, specialties(name)").eq("status", "active").order("created_at", { ascending: false }),
      supabase.from("course_enrollments").select("course_id, status").eq("student_id", user.id),
      supabase.from("specialties").select("id, name").order("sort_order"),
      supabase.from("course_enrollments").select("course_id").eq("status", "approved"),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (enrollRes.data) {
      const map: Record<string, string> = {};
      enrollRes.data.forEach((e: any) => { map[e.course_id] = e.status; });
      setEnrollments(map);
    }
    if (specRes.data) setSpecialties(specRes.data);
    if (countsRes.data) {
      const counts: Record<string, number> = {};
      countsRes.data.forEach((e: any) => { counts[e.course_id] = (counts[e.course_id] || 0) + 1; });
      setEnrollmentCounts(counts);
    }
    setLoading(false);
  };

  const filtered = courses.filter(c => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === "all" || c.specialty_id === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              {t("courses.catalog")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("courses.catalogSubtitle")}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("courses.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("courses.filterBySpecialty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("courses.allSpecialties")}</SelectItem>
              {specialties.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-card/50 border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t("courses.noCourses")}</p>
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
    </div>
  );
};

export default Courses;
