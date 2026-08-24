import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AiGatewayError, completeText, corsHeaders, parseJsonBlock } from "../_shared/lovable-ai.ts";

interface DebriefPayload {
  summary: string;
  weak_concepts: string[];
  quiz: { stem: string; options: string[]; correct_index: number; explanation: string }[];
}

const SYSTEM = `You are ATLAS™, faculty-grade AI professor at Livemed Academy.
After a live lecture you produce a personal debrief for one student.
Clinical accuracy is non-negotiable; never invent lecture content that was not provided.

Return ONLY JSON:
{
  "summary": "markdown recap: 4-6 bullets of what the lecture covered plus 2 bullets on what this student should shore up",
  "weak_concepts": ["2-5 short concept tags"],
  "quiz": [ { "stem": "clinical vignette question", "options": ["A","B","C","D"], "correct_index": 0, "explanation": "why" } ]
}
The quiz has exactly 5 USMLE-style questions, each with 4 options, targeting the weak concepts.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Invalid or expired token" }, 401);

    const { classroomId } = await req.json();
    if (!classroomId) return json({ error: "classroomId is required" }, 400);

    // Existing debrief wins — generation is one-shot per lecture per student.
    const { data: existing } = await supabase
      .from("lecture_debriefs")
      .select("*")
      .eq("classroom_id", classroomId)
      .eq("student_id", user.id)
      .maybeSingle();
    if (existing && existing.status === "ready" && existing.summary) {
      return json({ debrief: existing, cached: true });
    }

    // RLS keeps this scoped to lectures the student can actually see.
    const { data: lecture } = await supabase
      .from("virtual_classrooms")
      .select("id, title, description, scheduled_start, scheduled_end, topic_id")
      .eq("id", classroomId)
      .maybeSingle();
    if (!lecture) return json({ error: "Lecture not found" }, 404);

    const [{ data: presence }, { data: responses }, { data: topic }] = await Promise.all([
      supabase.from("classroom_presence").select("accumulated_seconds, called_on_count")
        .eq("classroom_id", classroomId).eq("user_id", user.id).maybeSingle(),
      supabase.from("live_quiz_responses").select("is_correct, question_index, quiz_id")
        .eq("student_id", user.id).limit(50),
      lecture.topic_id
        ? supabase.from("course_topics").select("title").eq("id", lecture.topic_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const attendance = presence?.accumulated_seconds ?? 0;
    const answered = responses?.length ?? 0;
    const correct = (responses ?? []).filter((r: { is_correct: boolean }) => r.is_correct).length;

    const raw = await completeText([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          `Lecture title: ${lecture.title}`,
          `Lecture description: ${lecture.description ?? "none"}`,
          topic?.title ? `Curriculum topic: ${topic.title}` : "",
          `Student attendance: ${Math.round(attendance / 60)} minutes`,
          `Live poll performance: ${correct}/${answered} correct`,
        ].filter(Boolean).join("\n"),
      },
    ]);

    const parsed = parseJsonBlock<DebriefPayload>(raw);
    const record = {
      classroom_id: classroomId,
      student_id: user.id,
      summary: parsed?.summary?.trim() || raw,
      weak_concepts: Array.isArray(parsed?.weak_concepts) ? parsed!.weak_concepts.slice(0, 5) : [],
      quiz: Array.isArray(parsed?.quiz) ? parsed!.quiz.slice(0, 5) : [],
      attendance_seconds: attendance,
      status: "ready",
    };

    const { data: debrief, error } = await supabase
      .from("lecture_debriefs")
      .upsert(record, { onConflict: "classroom_id,student_id" })
      .select()
      .single();

    if (error) return json({ error: error.message }, 400);
    return json({ debrief });
  } catch (e) {
    if (e instanceof AiGatewayError) return json({ error: e.message }, e.status);
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
