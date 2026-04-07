import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ExternalLink, Play, Trash2, Edit2 } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import EditLectureModal from "./EditLectureModal";

interface Props {
  lecture: any;
  isInstructor?: boolean;
  isEnrolled?: boolean;
  enrollmentCount?: number;
  onRefresh?: () => void;
}

export default function LectureCard({ lecture, isInstructor, isEnrolled, enrollmentCount, onRefresh }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    live: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("classroom_enrollments").insert({
      classroom_id: lecture.id,
      student_id: user.id,
    });
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("classroom.enrolled"), description: t("classroom.enrolledDesc") });
      onRefresh?.();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("virtual_classrooms").delete().eq("id", lecture.id);
    if (!error) onRefresh?.();
  };

  const handleStatusChange = async (status: string) => {
    await supabase.from("virtual_classrooms").update({ status }).eq("id", lecture.id);
    onRefresh?.();
  };

  const start = new Date(lecture.scheduled_start);
  const end = new Date(lecture.scheduled_end);

  return (
    <>
      <Card className={`bg-card/50 border-border/30 hover:border-border/60 transition-all ${lecture.status === "live" ? "ring-1 ring-green-500/30" : ""}`}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{lecture.title}</h3>
              {lecture.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lecture.description}</p>
              )}
            </div>
            <Badge variant="outline" className={statusColors[lecture.status] || ""}>
              {lecture.status === "live" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5" />}
              {t(`classroom.status.${lecture.status}`)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(start, "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(start, "h:mm a")} – {format(end, "h:mm a")}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {enrollmentCount !== undefined ? `${enrollmentCount}/` : ""}{lecture.max_students} {t("classroom.seats")}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isInstructor ? (
              <>
                {lecture.status === "scheduled" && (
                  <Button size="sm" onClick={() => handleStatusChange("live")} className="bg-green-600 hover:bg-green-700 text-white">
                    <Play className="h-3.5 w-3.5 mr-1.5" /> {t("classroom.goLive")}
                  </Button>
                )}
                {lecture.status === "live" && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange("completed")}>
                    {t("classroom.endLecture")}
                  </Button>
                )}
                {lecture.meeting_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={lecture.meeting_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> {t("classroom.openMeeting")}
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setShowEdit(true)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                {lecture.status === "scheduled" && (
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            ) : (
              <>
                {!isEnrolled && lecture.status === "scheduled" && (
                  <Button size="sm" onClick={handleEnroll} className="gradient-livemed">
                    {t("classroom.enroll")}
                  </Button>
                )}
                {isEnrolled && lecture.meeting_url && (lecture.status === "live" || lecture.status === "scheduled") && (
                  <Button size="sm" asChild className="gradient-livemed">
                    <a href={lecture.meeting_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> {t("classroom.joinLecture")}
                    </a>
                  </Button>
                )}
                {isEnrolled && (
                  <Badge variant="secondary" className="ml-auto">{t("classroom.enrolledBadge")}</Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isInstructor && (
        <EditLectureModal
          open={showEdit}
          onOpenChange={setShowEdit}
          lecture={lecture}
          onUpdated={() => { setShowEdit(false); onRefresh?.(); }}
        />
      )}
    </>
  );
}
