import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI service not configured" }, 500);

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !user) return json({ error: "Invalid token" }, 401);

    const { classroom_id, topic_hint } = await req.json();
    if (!classroom_id) return json({ error: "classroom_id required" }, 400);

    // Verify instructor owns this classroom
    const { data: classroom, error: cErr } = await supabase
      .from("virtual_classrooms")
      .select("id, title, description, instructor_id, course_id")
      .eq("id", classroom_id)
      .single();
    if (cErr || !classroom) return json({ error: "Lecture not found" }, 404);
    if (classroom.instructor_id !== user.id) {
      return json({ error: "Only the lecture instructor can generate quizzes" }, 403);
    }

    const topicContext = topic_hint || classroom.description || classroom.title;

    const prompt = `You are an NBME-style USMLE Step 2 CK question writer.

Lecture title: "${classroom.title}"
Topic / focus: ${topicContext}

Generate exactly 5 USMLE Step 2 CK style multiple-choice vignettes directly tied to this lecture topic.

Each question MUST:
- Open with a realistic clinical vignette (age, sex, presentation, exam findings, relevant labs/imaging)
- Test clinical reasoning (next best step, most likely diagnosis, best initial test, most appropriate management)
- Have exactly 5 answer options (A-E) — single best answer
- Include a concise NBME-style explanation explaining the correct answer AND why the distractors are wrong
- Vary cognitive level: 2 easy, 2 medium, 1 hard
- Distribute correct answers across A-E (do not always make A or C correct)

Use the create_live_quiz tool.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an NBME-style medical exam writer. Always use the create_live_quiz tool." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_live_quiz",
            description: "Return a 5-question NBME-style live quiz",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      stem: { type: "string", description: "Clinical vignette + question" },
                      options: { type: "array", items: { type: "string" }, description: "Exactly 5 options" },
                      correct_answer_index: { type: "integer", description: "0-4" },
                      explanation: { type: "string" },
                      difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                      concept: { type: "string", description: "Short concept tag" },
                    },
                    required: ["stem", "options", "correct_answer_index", "explanation", "difficulty", "concept"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_live_quiz" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return json({ error: "Rate limited. Try again shortly." }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted." }, 402);
      console.error("AI error", aiRes.status, await aiRes.text());
      return json({ error: "AI generation failed" }, 500);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return json({ error: "AI returned no quiz" }, 500);
    const quizData = JSON.parse(toolCall.function.arguments);

    const { data: saved, error: saveErr } = await supabase
      .from("live_quizzes")
      .insert({
        classroom_id,
        instructor_id: user.id,
        title: quizData.title || `Live Quiz — ${classroom.title}`,
        topic_hint: topicContext,
        questions: quizData.questions,
        status: "draft",
      })
      .select()
      .single();

    if (saveErr) {
      console.error("Save error", saveErr);
      return json({ error: saveErr.message }, 500);
    }

    return json({ success: true, quiz_id: saved.id, question_count: quizData.questions.length });
  } catch (e) {
    console.error("generate-live-quiz error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
