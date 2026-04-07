import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, CheckCircle2, XCircle, Clock, Video, BookOpen } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import LectureCard from "@/components/classroom/LectureCard";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const [courseRes, enrollRes, lecturesRes] = await Promise.all([
      supabase.from("courses").select("*, specialties(name)").eq("id", id!).single(),
      supabase.from("course_enrollments").select("*, profiles:student_id(first_name, last_name)").eq("course_id", id!),
      supabase.from("virtual_classrooms").select("*").eq("course_id", id!).order("scheduled_start"),
    ]);

    if (courseRes.data) {
      setCourse(courseRes.data);
      setIsInstructor(courseRes.data.instructor_id === user.id);
    }
    if (enrollRes.data) setEnrollments(enrollRes.data);
    if (lecturesRes.data) setLectures(lecturesRes.data);
    setLoading(false);
  };

  const handleEnrollmentAction = async (enrollmentId: string, status: string) => {
    const { error } = await supabase.from("course_enrollments").update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    }).eq("id", enrollmentId);

    if (!error) {
      toast({ title: status === "approved" ? t("courses.studentApproved") : t("courses.studentRejected") });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const pending = enrollments.filter(e => e.status === "pending");
  const approved = enrollments.filter(e => e.status === "approved");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {course.specialties?.name && <Badge variant="outline" className="mr-2">{course.specialties.name}</Badge>}
              {course.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: t("courses.enrolledStudents"), value: approved.length },
            { icon: Clock, label: t("courses.pendingRequests"), value: pending.length },
            { icon: Video, label: t("courses.totalLectures"), value: lectures.length },
            { icon: Calendar, label: t("courses.status.label"), value: t(`courses.status.${course.status}`) },
          ].map(s => (
            <Card key={s.label} className="bg-card/50 border-border/30">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Enrollment Requests - instructor only */}
        {isInstructor && pending.length > 0 && (
          <Card className="border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                {t("courses.pendingRequests")} ({pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      {e.profiles?.first_name || ""} {e.profiles?.last_name || t("courses.unknownStudent")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("courses.requestedOn")} {new Date(e.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEnrollmentAction(e.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t("courses.approve")}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleEnrollmentAction(e.id, "rejected")}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> {t("courses.reject")}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Student Roster - instructor only */}
        {isInstructor && approved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("courses.studentRoster")} ({approved.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {approved.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground">
                      {e.profiles?.first_name || ""} {e.profiles?.last_name || t("courses.unknownStudent")}
                    </p>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {t("courses.enrollment.approved")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lectures */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {t("courses.courseLectures")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lectures.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("courses.noLectures")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lectures.map(l => (
                  <LectureCard key={l.id} lecture={l} isInstructor={isInstructor} onRefresh={loadData} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetail;
