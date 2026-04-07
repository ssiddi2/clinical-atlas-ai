import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, BookOpen, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  course: any;
  isInstructor?: boolean;
  enrollmentStatus?: string | null; // pending, approved, rejected, or null
  enrollmentCount?: number;
  onRefresh?: () => void;
}

export default function CourseCard({ course, isInstructor, enrollmentStatus, enrollmentCount, onRefresh }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  const enrollmentColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("course_enrollments").insert({
      course_id: course.id,
      student_id: user.id,
    });
    if (error) {
      if (error.code === "23505") {
        toast({ title: t("courses.alreadyEnrolled"), variant: "destructive" });
      } else {
        toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: t("courses.enrollmentRequested"), description: t("courses.enrollmentRequestedDesc") });
      onRefresh?.();
    }
  };

  return (
    <Card className="bg-card/50 border-border/30 hover:border-border/60 transition-all">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
            )}
          </div>
          <Badge variant="outline" className={statusColors[course.status] || ""}>
            {t(`courses.status.${course.status}`)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {course.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(course.start_date).toLocaleDateString()} {course.end_date && `– ${new Date(course.end_date).toLocaleDateString()}`}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {enrollmentCount !== undefined ? `${enrollmentCount}/` : ""}{course.max_students} {t("courses.students")}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {isInstructor ? (
            <Button size="sm" variant="outline" onClick={() => navigate(`/courses/${course.id}`)}>
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> {t("courses.manage")}
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <>
              {!enrollmentStatus && course.status === "active" && (
                <Button size="sm" onClick={handleEnroll} className="gradient-livemed">
                  {t("courses.requestEnrollment")}
                </Button>
              )}
              {enrollmentStatus && (
                <Badge variant="outline" className={enrollmentColors[enrollmentStatus] || ""}>
                  {enrollmentStatus === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {enrollmentStatus === "pending" && <Clock className="h-3 w-3 mr-1" />}
                  {t(`courses.enrollment.${enrollmentStatus}`)}
                </Badge>
              )}
              {enrollmentStatus === "approved" && (
                <Button size="sm" variant="outline" onClick={() => navigate(`/courses/${course.id}`)}>
                  {t("courses.viewCourse")}
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
