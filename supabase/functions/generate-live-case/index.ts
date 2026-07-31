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
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI service not configured" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !user) return json({ error: "Invalid token" }, 401);

    const { classroom_id, topic_hint } = await req.json();
    if (!classroom_id) return json({ error: "classroom_id required" }, 400);

    const { data: classroom } = await supabase
      .from("virtual_classrooms")
      .select("id, title, description, instructor_id")
      .eq("id", classroom_id)
      .maybeSingle();
    if (!classroom) return json({ error: "Lecture not found" }, 404);
    if (classroom.instructor_id !== user.id) {
      return json({ error: "Only the lecture instructor can generate cases" }, 403);
    }

    const topic = topic_hint || classroom.description || classroom.title;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a clinical educator building interactive bedside teaching cases for US medical students. Always use the create_live_case tool. Clinical accuracy is critical.",
          },
          {
            role: "user",
            content: `Build one branching virtual patient case for a live lecture.

Lecture: "${classroom.title}"
Topic focus: ${topic}

Requirements:
- A realistic opening vignette (age, sex, chief complaint, vitals, pertinent exam).
- Exactly 4 sequential decision steps that mirror real clinical reasoning: initial workup, interpretation, management, disposition/complication.
- Each step: a prompt question, 4 plausible options (one clearly best), the index of the best option, a teaching explanation of why the best option wins and why the others fail, and a "reveal" block of new data (labs, imaging, vitals, or course) that unlocks after the vote.
- Use SI-free US conventional lab units with reference ranges in the reveal text.

Use the create_live_case tool.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_live_case",
            description: "Return a branching interactive clinical case",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                vignette: { type: "string" },
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      prompt: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct_index: { type: "integer" },
                      explanation: { type: "string" },
                      reveal: { type: "string", description: "New clinical data revealed after the vote" },
                    },
                    required: ["prompt", "options", "correct_index", "explanation", "reveal"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "vignette", "steps"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_live_case" } },
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
    if (!toolCall) return json({ error: "AI returned no case" }, 500);
    const parsed = JSON.parse(toolCall.function.arguments);

    const { data: saved, error: saveErr } = await supabase
      .from("live_cases")
      .insert({
        classroom_id,
        instructor_id: user.id,
        title: parsed.title || `Case — ${classroom.title}`,
        vignette: parsed.vignette,
        steps: parsed.steps,
        status: "draft",
      })
      .select()
      .single();

    if (saveErr) return json({ error: saveErr.message }, 500);
    return json({ success: true, case_id: saved.id, step_count: parsed.steps.length });
  } catch (e) {
    console.error("generate-live-case error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}