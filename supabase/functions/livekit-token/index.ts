import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AccessToken } from "npm:livekit-server-sdk@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const lkUrl = Deno.env.get("LIVEKIT_URL");
    const lkKey = Deno.env.get("LIVEKIT_API_KEY");
    const lkSecret = Deno.env.get("LIVEKIT_API_SECRET");
    if (!lkUrl || !lkKey || !lkSecret) {
      return json({ error: "Live video is not configured yet.", not_configured: true }, 503);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !user) return json({ error: "Invalid token" }, 401);

    const body = await req.json().catch(() => ({}));
    const classroomId = typeof body.classroom_id === "string" ? body.classroom_id : "";
    if (!/^[0-9a-f-]{36}$/i.test(classroomId)) return json({ error: "classroom_id required" }, 400);

    const { data: classroom } = await supabase
      .from("virtual_classrooms")
      .select("id, title, instructor_id, status")
      .eq("id", classroomId)
      .maybeSingle();
    if (!classroom) return json({ error: "Lecture not found" }, 404);

    const isInstructor = classroom.instructor_id === user.id;
    if (!isInstructor) {
      const { data: enrolled } = await supabase
        .from("classroom_enrollments")
        .select("id")
        .eq("classroom_id", classroomId)
        .eq("student_id", user.id)
        .maybeSingle();
      if (!enrolled) return json({ error: "You are not enrolled in this lecture" }, 403);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      user.email?.split("@")[0] || "Participant";

    const at = new AccessToken(lkKey, lkSecret, {
      identity: user.id,
      name,
      metadata: JSON.stringify({
        role: isInstructor ? "instructor" : "student",
        avatar_url: profile?.avatar_url ?? null,
      }),
      ttl: "4h",
    });

    at.addGrant({
      room: `lecture-${classroomId}`,
      roomJoin: true,
      canPublish: isInstructor,
      canPublishData: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
      roomAdmin: isInstructor,
    });

    return json({
      token: await at.toJwt(),
      url: lkUrl,
      room: `lecture-${classroomId}`,
      identity: user.id,
      role: isInstructor ? "instructor" : "student",
    });
  } catch (e) {
    console.error("livekit-token error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}