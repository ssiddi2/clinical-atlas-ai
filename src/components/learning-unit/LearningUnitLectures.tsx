import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import CreateLectureModal from "@/components/classroom/CreateLectureModal";

interface Props {
  topicId: string;
  courseId: string;
  isInstructor: boolean;
}

export default function LearningUnitLectures({ topicId, courseId, isInstructor }: Props) {
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("virtual_classrooms")
      .select("*")
      .eq("topic_id", topicId)
      .order("scheduled_start", { ascending: false });
    if (data) setLectures(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [topicId]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const statusColor: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    live: "bg-green-500/10 text-green-400 border-green-500/30",
    completed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      {isInstructor && (
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Video className="h-3.5 w-3.5 mr-1" /> Create Lecture for This Topic
        </Button>
      )}

      {lectures.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No lectures linked to this topic yet.</p>
      ) : (
        <div className="space-y-2">
          {lectures.map(l => (
            <Card key={l.id} className="bg-card/50">
              <CardContent className="flex items-center gap-3 p-4">
                <Video className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{l.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(l.scheduled_start), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <Badge variant="outline" className={statusColor[l.status] || ""}>{l.status}</Badge>
                {l.meeting_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={l.meeting_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateLectureModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
          defaultCourseId={courseId}
          defaultTopicId={topicId}
        />
      )}
    </div>
  );
}
