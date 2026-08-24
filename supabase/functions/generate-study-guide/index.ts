import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AiGatewayError, completeText, corsHeaders, parseJsonBlock } from "../_shared/lovable-ai.ts";

interface GuidePayload {
  title: string;
  focus_areas: string[];
  subject: string;
  content: string;
}

const SYSTEM = `You are ATLAS™, faculty-grade AI professor at Livemed Academy.
You write compact, exam-focused study guides for medical students preparing for USMLE Step 1 / Step 2 CK.
Clinical accuracy is non-negotiable. Never invent references.

Return ONLY JSON with this exact shape:
{
  "title": "short guide title",
  "subject": "the closest USMLE subject, e.g. Cardiology",
  "focus_areas": ["3-6 short concept tags used later to pull practice questions"],
  "content": "markdown study guide"
}

The markdown content MUST use these sections, in order:
## Why this matters
## High-yield essentials  (tight bullets)
## Mechanism / reasoning chain
## Exam traps
## Rapid review table  (markdown table, max 6 rows)
## 30-minute study block  (numbered steps with minutes)
Keep the whole guide under 700 words.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Invalid or expired token" }, 401);

    const body = await req.json();
    const prompt: string = String(body.prompt ?? "").slice(0, 2000);
    const cardKey: string | null = body.cardKey ?? null;
    const cardType: string | null = body.cardType ?? null;
    const topicId: string | null = body.topicId ?? null;
    const artifactId: string | null = body.artifactId ?? null;

    const context: string = String(body.context ?? "").slice(0, 2000);

    if (!prompt) return json({ error: "A prompt is required" }, 400);

    // Personalize with the student's profile signals.
    const { data: profile } = await supabase
      .from("profiles")
      .select("program_level, target_specialty, weak_areas, learning_style, study_hours_per_week")
      .eq("user_id", user.id)
      .maybeSingle();

    const learner = [
      profile?.program_level ? `Program level: ${profile.program_level}` : "",
      profile?.target_specialty ? `Target specialty: ${profile.target_specialty}` : "",
      profile?.learning_style ? `Learning style: ${profile.learning_style}` : "",
      profile?.weak_areas?.length ? `Known weak areas: ${profile.weak_areas.join(", ")}` : "",
      profile?.study_hours_per_week ? `Weekly study hours: ${profile.study_hours_per_week}` : "",
    ].filter(Boolean).join("\n");

    const raw = await completeText([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Student request: ${prompt}\n\nDashboard context: ${context || "none"}\n\nLearner profile:\n${learner || "unknown"}`,
      },
    ]);

    const parsed = parseJsonBlock<GuidePayload>(raw);
    const title = parsed?.title?.trim() || prompt.slice(0, 80);
    const content = parsed?.content?.trim() || raw;
    const focus = Array.isArray(parsed?.focus_areas) ? parsed!.focus_areas.slice(0, 6).map(String) : [];

    const { data: guide, error } = await supabase
      .from("study_guides")
      .insert({
        user_id: user.id,
        card_key: cardKey,
        card_type: cardType,
        topic_id: topicId,
        title,
        subject: parsed?.subject ?? null,
        focus_areas: focus,
        content,
        status: "ready",
        model: "openai/gpt-5.6-sol",
      })
      .select()
      .single();

    if (error) return json({ error: error.message }, 400);
    return json({ guide });
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
