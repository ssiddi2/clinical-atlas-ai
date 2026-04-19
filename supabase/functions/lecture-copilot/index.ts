import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are ATLAS Co-Pilot, a quiet whisper-in-the-ear AI tutor for a medical student during a LIVE lecture. The student cannot interrupt the attending, so they're asking you privately.

Rules:
- Be FAST and CONCISE: 2–4 short paragraphs MAX, or a tight bulleted list.
- Use markdown (**bold** for key terms, bullet points for lists).
- Assume the student is mid-lecture and needs a quick clarifying answer they can absorb in 30 seconds.
- If the question is broad, answer the highest-yield piece and offer to expand later.
- Use clinical USMLE Step 2 framing where relevant.
- Never lecture them about asking — just answer.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const studentId = userData.user.id;

    const { classroom_id, question } = await req.json();
    if (!classroom_id || !question?.trim()) {
      return new Response(JSON.stringify({ error: "classroom_id and question required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Service-role client to write back to the question row (bypass RLS for the answer update)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch lecture context
    const { data: classroom } = await adminClient
      .from("virtual_classrooms")
      .select("title, description")
      .eq("id", classroom_id)
      .maybeSingle();

    // Insert pending question (uses user client so RLS verifies enrollment)
    const { data: inserted, error: insertError } = await userClient
      .from("lecture_copilot_questions")
      .insert({ classroom_id, student_id: studentId, question, status: "pending" })
      .select()
      .single();

    if (insertError || !inserted) {
      return new Response(JSON.stringify({ error: insertError?.message || "Insert failed" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lectureContext = classroom
      ? `Current lecture: "${classroom.title}"${classroom.description ? `\nLecture description: ${classroom.description}` : ""}\n\n`
      : "";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${lectureContext}Student question: ${question}` },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      await adminClient.from("lecture_copilot_questions").update({ status: "error" }).eq("id", inserted.id);
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed", status: aiResponse.status }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiJson = await aiResponse.json();
    const answer = aiJson?.choices?.[0]?.message?.content?.trim() || "I couldn't generate an answer. Try rephrasing.";

    await adminClient
      .from("lecture_copilot_questions")
      .update({ answer, status: "answered", answered_at: new Date().toISOString() })
      .eq("id", inserted.id);

    return new Response(JSON.stringify({ id: inserted.id, answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("lecture-copilot error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
