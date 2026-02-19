import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

Remember: You are the most patient, consistent, and rigorous professor a student will ever have.`;

serve(async (req) => {
  // Handle CORS preflight
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    const { message, conversationId, history = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages array for the AI
    const messages = [
      { role: "system", content: ATLAS_SYSTEM_PROMPT },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Call the Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";

    console.log(`ATLAS response generated for user: ${userId}, conversation: ${conversationId}`);

    return new Response(
      JSON.stringify({ reply, conversationId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in atlas-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate response", 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
