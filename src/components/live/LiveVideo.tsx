import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Video, ExternalLink } from "lucide-react";

interface Props {
  classroomId: string;
  fallbackUrl?: string | null;
}

/** In-app LiveKit video. Falls back to the external meeting link if video isn't configured. */
export default function LiveVideo({ classroomId, fallbackUrl }: Props) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; token: string; url: string } | { status: "error"; message: string; notConfigured?: boolean }
  >({ status: "loading" });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.functions.invoke("livekit-token", { body: { classroom_id: classroomId } });
      if (!active) return;
      if (error || !data?.token) {
        const notConfigured = Boolean(data?.not_configured) || /not configured/i.test(error?.message ?? "");
        setState({
          status: "error",
          message: data?.error || error?.message || "Could not join the video room.",
          notConfigured,
        });
        return;
      }
      setState({ status: "ready", token: data.token, url: data.url });
    })();
    return () => { active = false; };
  }, [classroomId]);

  if (state.status === "loading") {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-border bg-muted/30">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted/30 p-6 text-center">
        <Video className="h-7 w-7 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          {state.notConfigured
            ? "In-app video isn't switched on for this workspace yet. Every other studio tool still works."
            : state.message}
        </p>
        {fallbackUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={fallbackUrl} target="_blank" rel="noopener noreferrer">
              Open the external meeting <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full min-h-[420px] overflow-hidden rounded-2xl border border-border">
      <LiveKitRoom
        token={state.token}
        serverUrl={state.url}
        connect
        video
        audio
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}