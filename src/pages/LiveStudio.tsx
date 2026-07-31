import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Video, PenLine, Layers, Stethoscope, Hand, Sparkles, Loader2, ArrowLeft, Radio } from "lucide-react";
import { useLiveStage, type StageMode } from "@/hooks/useLiveStage";
import { useClassroomPresence, type Participant } from "@/hooks/useClassroomPresence";
import LiveVideo from "@/components/live/LiveVideo";
import Whiteboard from "@/components/live/Whiteboard";
import DiagramStage from "@/components/live/DiagramStage";
import LiveCasePanel from "@/components/live/LiveCasePanel";
import RosterPanel from "@/components/live/RosterPanel";
import ReactionPanel from "@/components/classroom/ReactionPanel";
import ReactionMeter from "@/components/classroom/ReactionMeter";
import CopilotSidebar from "@/components/classroom/CopilotSidebar";
import LiveQuizDashboard from "@/components/classroom/LiveQuizDashboard";

const MODES: { key: StageMode; label: string; icon: typeof Video }[] = [
  { key: "video", label: "Video", icon: Video },
  { key: "whiteboard", label: "Whiteboard", icon: PenLine },
  { key: "diagram", label: "Animation", icon: Layers },
  { key: "case", label: "Live case", icon: Stethoscope },
];

export default function LiveStudio() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const [lecture, setLecture] = useState<any>(null);
  const [access, setAccess] = useState<"loading" | "instructor" | "student" | "denied">("loading");
  const [showQuiz, setShowQuiz] = useState(false);
  const [handUp, setHandUp] = useState(false);

  const { stage, pushStage } = useLiveStage(id);
  const { participants, setHand, refresh } = useClassroomPresence(
    access === "instructor" || access === "student" ? id : "",
    userId,
  );

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/auth");
      setUserId(user.id);

      const { data: room } = await supabase
        .from("virtual_classrooms")
        .select("id, title, description, status, instructor_id, meeting_url, scheduled_start")
        .eq("id", id)
        .maybeSingle();
      if (!room) return setAccess("denied");
      setLecture(room);

      if (room.instructor_id === user.id) return setAccess("instructor");
      const { data: enrolled } = await supabase
        .from("classroom_enrollments")
        .select("id")
        .eq("classroom_id", id)
        .eq("student_id", user.id)
        .maybeSingle();
      setAccess(enrolled ? "student" : "denied");
    })();
  }, [id, navigate]);

  const isInstructor = access === "instructor";

  const callOn = useCallback(async (p: Participant) => {
    await supabase
      .from("classroom_presence")
      .update({ called_on_count: p.called_on_count + 1, hand_raised_at: null })
      .eq("classroom_id", id)
      .eq("user_id", p.user_id);
    toast.success(`Calling on ${p.name}`);
    refresh();
  }, [id, refresh]);

  const endLecture = async () => {
    await supabase.from("virtual_classrooms").update({ status: "completed" }).eq("id", id);
    const { error } = await supabase.rpc("finalize_classroom_attendance", {
      _classroom_id: id,
      _min_seconds: 600,
    });
    if (error) toast.error("Attendance could not be finalised.");
    else toast.success("Lecture ended and attendance recorded.");
    navigate("/virtual-classroom");
  };

  const toggleHand = () => {
    const next = !handUp;
    setHandUp(next);
    setHand(next);
  };

  if (access === "loading") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (access === "denied") {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-24 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground">Lecture not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to be enrolled in this lecture to enter the studio.
          </p>
          <Button className="mt-6" onClick={() => navigate("/virtual-classroom")}>Back to lectures</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4 py-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/virtual-classroom")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Lectures
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold text-foreground">{lecture?.title}</h1>
          </div>
          {lecture?.status === "live" && (
            <Badge className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600">
              <Radio className="h-3 w-3" /> Live
            </Badge>
          )}
          {isInstructor ? (
            <div className="flex gap-2">
              {lecture?.status !== "live" && (
                <Button size="sm" onClick={async () => {
                  await supabase.from("virtual_classrooms").update({ status: "live" }).eq("id", id);
                  setLecture((l: any) => ({ ...l, status: "live" }));
                }}>Go live</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowQuiz(true)}>
                <Sparkles className="mr-1 h-3.5 w-3.5" /> Live quiz
              </Button>
              <Button size="sm" variant="outline" onClick={endLecture}>End lecture</Button>
            </div>
          ) : (
            <Button size="sm" variant={handUp ? "default" : "outline"} onClick={toggleHand}>
              <Hand className="mr-1 h-3.5 w-3.5" /> {handUp ? "Hand raised" : "Raise hand"}
            </Button>
          )}
        </div>

        {/* Mode switcher */}
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = stage.mode === m.key;
            return (
              <Button
                key={m.key}
                size="sm"
                variant={active ? "default" : "outline"}
                disabled={!isInstructor && !active}
                onClick={() => isInstructor && pushStage(m.key, m.key === stage.mode ? stage.payload : {})}
              >
                <Icon className="mr-1.5 h-3.5 w-3.5" /> {m.label}
              </Button>
            );
          })}
          {!isInstructor && (
            <span className="self-center text-xs text-muted-foreground">Your instructor controls the stage.</span>
          )}
        </div>

        {/* Stage + rail */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-[520px] rounded-2xl border border-border bg-card p-4">
            {stage.mode === "video" && <LiveVideo classroomId={id} fallbackUrl={lecture?.meeting_url} />}
            {stage.mode === "whiteboard" && (
              <Whiteboard classroomId={id} canDraw={isInstructor} backgroundUrl={stage.payload.backgroundUrl} />
            )}
            {stage.mode === "diagram" && (
              <DiagramStage
                sceneId={stage.payload.sceneId}
                stepIndex={stage.payload.stepIndex ?? 0}
                canControl={isInstructor}
                onChange={(sceneId, stepIndex) => pushStage("diagram", { sceneId, stepIndex })}
              />
            )}
            {stage.mode === "case" && (
              <LiveCasePanel classroomId={id} userId={userId} isInstructor={isInstructor} />
            )}
          </div>

          <div className="space-y-4">
            <div className="h-[320px] rounded-2xl border border-border bg-card p-4">
              <RosterPanel participants={participants} canManage={isInstructor} onCallOn={callOn} />
            </div>
            <ReactionMeter classroomId={id} />
            {!isInstructor && userId && (
              <>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">How's the pace?</p>
                  <ReactionPanel classroomId={id} studentId={userId} />
                </div>
                <CopilotSidebar classroomId={id} studentId={userId} />
              </>
            )}
          </div>
        </div>
      </div>

      {isInstructor && (
        <LiveQuizDashboard
          open={showQuiz}
          onOpenChange={setShowQuiz}
          classroomId={id}
          classroomTitle={lecture?.title || "Lecture"}
        />
      )}
    </AppShell>
  );
}