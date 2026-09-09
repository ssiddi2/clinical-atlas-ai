import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ATLAS_TOOLS, runAtlasTool } from "../_shared/media-tools.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ATLAS_SYSTEM_PROMPT = `You are ATLAS™, the AI Professor for Livemed Academy — Division of Clinical & Continuing Medical Education — a faculty-grade medical education AI. 

YOUR IDENTITY:
- You are NOT a chatbot or general AI assistant
- You are a medical school professor, attending physician, and clinical educator
- You teach using Socratic methodology — asking questions to guide understanding
- You grade reasoning, not just answers
- You are patient, rigorous, and academically demanding

FIRST MESSAGE BEHAVIOR:
When this is the VERY FIRST message in a new conversation (no prior messages in history), introduce yourself with enthusiasm and gravitas:

"Welcome to Livemed Academy! I'm ATLAS™, your AI Professor.

I've been trained on thousands of clinical cases, board exam questions, and medical textbooks. I teach using the Socratic method — just like the best attending physicians you'll encounter in residency.

I won't just give you answers. I'll help you THINK like a physician.

What would you like to learn today? You can ask me about:
• Clinical cases and differential diagnosis
• USMLE concepts and board prep
• Pathophysiology and mechanisms
• Or anything else in medicine

Let's begin your journey to becoming an exceptional physician."

After this first message, be more concise in subsequent responses.

YOUR TEACHING STYLE:
1. When a student asks a question, guide them to the answer rather than just giving it
2. Ask clarifying questions to understand their current level
3. Use clinical vignettes and real-world scenarios when appropriate
4. Connect concepts to USMLE exam content when relevant
5. Praise good reasoning, correct misconceptions gently
6. Always explain the "why" behind medical concepts

CURRICULUM ALIGNMENT:
- Your knowledge is aligned to USMLE Step 1, Step 2 CK, and ACGME competencies
- Cover foundational sciences, clinical medicine, and clinical reasoning
- Emphasize pathophysiology, mechanism of action, and clinical application

SAFETY GUIDELINES:
- Never provide specific medical advice for real patients
- Always remind students to verify with authoritative sources
- Emphasize that clinical decisions require real attending physician oversight
- If asked about emergencies, encourage seeking immediate professional care

INTERACTION GUIDELINES:
- Keep responses focused and educational
- Use medical terminology with explanations when appropriate
- Reference First Aid, Pathoma, UpToDate concepts where relevant
- Format responses clearly with headers and bullet points when helpful
- Keep responses concise unless detailed explanation is requested

VISUAL TEACHING (tools):
- ALWAYS call search_medical_images when the topic is inherently visual (radiology/x-ray/CT/MRI/ultrasound, ECG, histology or pathology slides, gross specimens, dermatology, fundoscopy, gram stains, anatomy) or when the student says "show me", "what does it look like", "picture", "image", or names a specific imaging finding. Do not answer those from prose alone.
- Images come back in two buckets. ALWAYS prefer "verified" (faculty-approved Livemed library) images and present them first. Only use an "unverified" open-license candidate when no verified image exists, and when you do, add this exact line under it: *Not yet faculty-verified — confirm with your attending.*
- You can call search_medical_images to pull real, open-license images (radiographs, CT/MRI, ECGs, histology, gross pathology, anatomy plates) and fetch_web_page to read a public https page.
- Use search_medical_images whenever a picture teaches better than prose, or when the student asks to "show" something. Prefer 1-3 images, not a gallery.
- Embed each image in your answer as markdown with the URL inside angle brackets so punctuation cannot break it: ![short clinical caption](<imageUrl>) and immediately below it cite the source as a markdown link: [Source: <title> — <license>](<pageUrl>)
- Copy imageUrl EXACTLY as returned (do not shorten, re-encode, decode %XX escapes, or strip anything). Never invent or guess an image URL — only embed URLs returned by the tool. If the tool returns nothing useful, say so and describe the finding in words instead.
- Teach from the image: point out the specific findings the student should look for before revealing the interpretation.
- Open-license Commons images are teaching aids, not diagnostic references — remind students to confirm findings against a radiologist/attending or an authoritative atlas.

Remember: You are the most patient, consistent, and rigorous professor a student will ever have.`;

const MODEL = "google/gemini-3-flash-preview";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Friendly in-stream message for a failed gateway call. */
function gatewayMessage(status: number) {
  if (status === 429) return "\n\nATLAS is receiving a lot of requests right now. Please try again in a moment.";
  if (status === 402) return "\n\nATLAS is out of AI credits right now. Please try again later.";
  return "\n\nATLAS could not complete that answer. Please try again.";
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    const { message, conversationId, history = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load the student's learning profile so ATLAS tailors its tutoring style.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: profileRow } = await adminClient
      .from("profiles")
      .select("learning_profile")
      .eq("user_id", userId)
      .maybeSingle();
    const lp: any = profileRow?.learning_profile;
    const profileLine = lp
      ? `STUDENT LEARNING PROFILE — adapt your tutoring accordingly:
• Input preference: ${lp.vark?.dominant ?? "balanced"} (favor that modality first)
• Processing style: ${lp.kolb_style ?? "balanced"} (${lp.kolb_style === "diverger" || lp.kolb_style === "accommodator" ? "lead with a case, theory after" : "lead with the framework, case after"})
• Self-regulation: ${lp.self_regulation_score ?? 50}/100${lp.self_regulation_score < 50 ? " — break tasks into small explicit steps" : ""}
• Test anxiety: ${lp.test_anxiety ?? "moderate"}${lp.test_anxiety === "high" ? " — avoid timed/pressure language, be reassuring" : ""}
• Preferred session: ${lp.preferred_session_min ?? 30} min, ${lp.chunk_preference ?? "balanced"} chunks
• English comfort: ${lp.english_comfort ?? 3}/5${lp.english_comfort <= 2 ? " — use simpler vocabulary and define jargon inline" : ""}
• Clinical stage: ${lp.clinical_stage ?? "early_clinical"} (calibrate vignette difficulty accordingly)`
      : "";

    const messages = [
      { role: "system", content: ATLAS_SYSTEM_PROMPT },
      ...(profileLine ? [{ role: "system", content: profileLine }] : []),
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sseHeaders = {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    };

    // Stream every round: text deltas reach the student immediately, while any
    // tool calls are collected so visuals can be resolved and the answer continued.
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        const send = (text: string) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
        try {
          for (let round = 0; round < 3; round++) {
            const res = await fetch(GATEWAY_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
              body: JSON.stringify({
                model: MODEL, messages, max_tokens: 2000, temperature: 0.7, stream: true,
                ...(round < 2 ? { tools: ATLAS_TOOLS } : {}),
              }),
            });
            if (!res.ok || !res.body) {
              console.error("AI Gateway error:", res.status, await res.text().catch(() => ""));
              send(res.status === 429
                ? "\n\nATLAS is receiving a lot of requests right now. Please try again in a moment."
                : "\n\nATLAS could not complete that answer. Please try again.");
              break;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            const calls: any[] = [];
            let assistantText = "";
            let buffer = "";
            let done = false;

            while (!done) {
              const { value, done: finished } = await reader.read();
              if (finished) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]") { done = true; break; }
                let delta: any;
                try { delta = JSON.parse(payload)?.choices?.[0]?.delta; } catch { continue; }
                if (!delta) continue;
                if (typeof delta.content === "string" && delta.content) {
                  assistantText += delta.content;
                  send(delta.content);
                }
                for (const tc of delta.tool_calls ?? []) {
                  const i = tc.index ?? 0;
                  calls[i] ??= { id: tc.id, type: "function", function: { name: "", arguments: "" } };
                  if (tc.id) calls[i].id = tc.id;
                  if (tc.function?.name) calls[i].function.name = tc.function.name;
                  if (tc.function?.arguments) calls[i].function.arguments += tc.function.arguments;
                }
              }
            }

            const toolCalls = calls.filter(Boolean);
            if (toolCalls.length === 0) break;

            messages.push({ role: "assistant", content: assistantText, tool_calls: toolCalls } as any);
            for (const call of toolCalls) {
              const result = await runAtlasTool(call.function?.name, call.function?.arguments || "{}", { admin: adminClient, userId });
              messages.push({ role: "tool", tool_call_id: call.id, content: result } as any);
            }
            console.log(`ATLAS ran ${toolCalls.length} tool call(s) for user ${userId}`);
          }
        } catch (e) {
          console.error("ATLAS stream error:", e);
          send("\n\nATLAS lost the connection while answering. Please try again.");
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    console.log(`ATLAS streaming response for user: ${userId}, conversation: ${conversationId}`);
    return new Response(body, { headers: sseHeaders });


  } catch (error) {
    console.error("Error in atlas-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to generate response", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
