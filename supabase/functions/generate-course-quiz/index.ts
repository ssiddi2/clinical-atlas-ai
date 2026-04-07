import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { course_id } = await req.json();
    if (!course_id) {
      return new Response(JSON.stringify({ error: "course_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is instructor of this course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, instructor_id, description")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (course.instructor_id !== user.id) {
      return new Response(JSON.stringify({ error: "Only the course instructor can generate quizzes" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get course materials metadata
    const { data: materials } = await supabase
      .from("course_materials")
      .select("file_name, material_type, description")
      .eq("course_id", course_id);

    const materialContext = materials && materials.length > 0
      ? `Course materials: ${materials.map(m => `${m.file_name} (${m.material_type})`).join(", ")}`
      : "No materials uploaded yet.";

    const prompt = `You are a medical education expert. Generate a quiz for the following medical course.

Course: "${course.title}"
Description: ${course.description || "No description provided."}
${materialContext}

Generate 10 high-quality multiple-choice questions (MCQs) appropriate for medical students. Each question should:
- Test clinical reasoning and application, not just memorization
- Have 4 answer options (A-D)
- Include a clear explanation for the correct answer
- Vary in difficulty

Return the quiz using the generate_quiz tool.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a medical education quiz generator. Always use the generate_quiz tool to return structured quiz data." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate a structured medical quiz with MCQ questions",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Quiz title" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        stem: { type: "string", description: "The question stem" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          description: "4 answer options",
                        },
                        correct_answer_index: {
                          type: "integer",
                          description: "0-based index of the correct answer",
                        },
                        explanation: {
                          type: "string",
                          description: "Explanation of the correct answer",
                        },
                      },
                      required: ["stem", "options", "correct_answer_index", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("AI did not return structured quiz data");
    }

    const quizData = JSON.parse(toolCall.function.arguments);

    // Save quiz to database
    const { data: savedQuiz, error: saveError } = await supabase
      .from("course_quizzes")
      .insert({
        course_id,
        title: quizData.title || `${course.title} Quiz`,
        questions: quizData.questions,
        created_by: user.id,
        status: "draft",
      })
      .select()
      .single();

    if (saveError) throw saveError;

    console.log(`Quiz generated for course ${course_id} by user ${user.id}: ${quizData.questions.length} questions`);

    return new Response(JSON.stringify({
      success: true,
      quiz_id: savedQuiz.id,
      question_count: quizData.questions.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Generate quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
