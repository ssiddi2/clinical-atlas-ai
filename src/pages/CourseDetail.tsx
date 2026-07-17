import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Calendar, CheckCircle2, XCircle, Clock, Video, BookOpen, FileText, ClipboardCheck, BarChart3, Edit2, Plus, Layers } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import LectureCard from "@/components/classroom/LectureCard";
import CourseMaterials from "@/components/courses/CourseMaterials";
import CourseQuizzes from "@/components/courses/CourseQuizzes";
import CurriculumBuilder from "@/components/courses/CurriculumBuilder";
import CourseAnalytics from "@/components/courses/CourseAnalytics";
import EditCourseModal from "@/components/courses/EditCourseModal";
import CreateLectureModal from "@/components/classroom/CreateLectureModal";
import StudentProfileView from "@/components/courses/StudentProfileView";
import AppShell from "@/components/layout/AppShell";

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
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showCreateLecture, setShowCreateLecture] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const [courseRes, enrollRes, lecturesRes] = await Promise.all([
      supabase.from("courses").select("*, specialties(name)").eq("id", id!).single(),
      supabase.from("course_enrollments").select("*, profiles:student_id(first_name, last_name, user_id)").eq("course_id", id!),
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
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (enrollment) {
        await supabase.from("notifications").insert({
          user_id: enrollment.student_id,
          type: "enrollment_" + status,
          title: status === "approved" ? "Enrollment approved!" : "Enrollment rejected",
          message: `Your enrollment in "${course?.title}" has been ${status}.`,
          link: status === "approved" ? `/courses/${id}` : "/courses",
        });
      }
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
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
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
          {isInstructor && (
            <Button variant="outline" size="sm" onClick={() => setShowEditCourse(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          )}
        </div>

        {/* Stats */}
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

        {/* Tabs */}
        <Tabs defaultValue="curriculum" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="curriculum" className="flex items-center gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" /> Curriculum
            </TabsTrigger>
            <TabsTrigger value="lectures" className="flex items-center gap-1.5 text-xs">
              <Video className="h-3.5 w-3.5" /> Lectures
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Materials
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-1.5 text-xs">
              <ClipboardCheck className="h-3.5 w-3.5" /> Quizzes
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Students
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Course Curriculum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurriculumBuilder courseId={id!} isInstructor={isInstructor} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lectures Tab */}
          <TabsContent value="lectures">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  {t("courses.courseLectures")}
                </CardTitle>
                {isInstructor && (
                  <Button size="sm" variant="outline" onClick={() => setShowCreateLecture(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Lecture
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {lectures.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("courses.noLectures")}</p>
                    {isInstructor && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreateLecture(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Create First Lecture
                      </Button>
                    )}
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
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Course Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseMaterials courseId={id!} isInstructor={isInstructor} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Course Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseQuizzes courseId={id!} isInstructor={isInstructor} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            {/* Pending */}
            {isInstructor && pending.length > 0 && (
              <Card className="border-yellow-500/30 mb-4">
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

            {/* Roster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t("courses.studentRoster")} ({approved.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approved.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No enrolled students yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {approved.map((e: any) => (
                      <div
                        key={e.id}
                        className={`flex items-center justify-between p-3 bg-muted/30 rounded-lg ${isInstructor ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
                        onClick={() => isInstructor && setSelectedStudent(e.student_id)}
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {e.profiles?.first_name || ""} {e.profiles?.last_name || t("courses.unknownStudent")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {t("courses.enrollment.approved")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Course Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseAnalytics courseId={id!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {isInstructor && course && (
        <EditCourseModal
          open={showEditCourse}
          onOpenChange={setShowEditCourse}
          course={course}
          onUpdated={() => { setShowEditCourse(false); loadData(); }}
        />
      )}

      {isInstructor && (
        <CreateLectureModal
          open={showCreateLecture}
          onOpenChange={setShowCreateLecture}
          onCreated={() => { setShowCreateLecture(false); loadData(); }}
          defaultCourseId={id}
        />
      )}

      {selectedStudent && (
        <StudentProfileView
          open={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          studentId={selectedStudent}
          courseId={id!}
        />
      )}
    </AppShell>
  );
};

export default CourseDetail;
