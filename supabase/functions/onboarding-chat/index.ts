import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedData {
  institution?: string;
  country?: string;
  year_of_study?: string;
  medical_school_type?: string;
  expected_graduation?: string;
  target_specialty?: string;
  usmle_step1_status?: string;
  usmle_step1_score?: string;
  usmle_step2_status?: string;
  usmle_step2_score?: string;
  career_goals?: string;
  study_hours_per_week?: string;
  learning_style?: string;
  weak_areas?: string[];
  city?: string;
  state_province?: string;
  address_line1?: string;
  phone_number?: string;
}

const ONBOARDING_STEPS = [
  'welcome',
  'academic_info',
  'career_goals',
  'learning_preferences',
  'contact_location',
  'document_upload',
  'complete'
] as const;

const SYSTEM_PROMPT = `You are a friendly onboarding assistant for Livemed Learning, a medical education platform for medical students worldwide. Your role is to guide new students through completing their profile in a conversational, warm manner.

You are currently helping a medical student complete their profile. Ask questions naturally and conversationally, one topic at a time. Be encouraging and professional.

IMPORTANT RULES:
1. Ask only ONE question at a time
2. When you receive an answer, extract the relevant data and acknowledge it warmly
3. Move through the topics in order: academic info → career goals → learning preferences → contact info
4. Be concise but friendly
5. If an answer is unclear, politely ask for clarification
6. After each response, include a JSON block with extracted data in this format:
   <<<EXTRACTED_DATA>>>{"field_name": "value"}<<<END_DATA>>>

PROFILE FIELDS TO COLLECT:
- institution (medical school name)
- country
- year_of_study (1-6)
- medical_school_type (allopathic/osteopathic/international)
- expected_graduation (year)
- target_specialty (desired residency specialty)
- usmle_step1_status (not_taken/scheduled/passed)
- usmle_step1_score (optional, if passed)
- usmle_step2_status (not_taken/scheduled/passed)
- career_goals (free text about their aspirations)
- study_hours_per_week (number)
- learning_style (visual/auditory/reading/kinesthetic)
- weak_areas (array of medical topics they struggle with)
- city
- state_province
- address_line1 (optional, for certificate mailing)
- phone_number (for session reminders)

CONVERSATION FLOW:
1. WELCOME: Greet them by name, explain you'll help set up their profile
2. ACADEMIC: Ask about their medical school, year, and type (MD/DO/International)
3. EXAMS: Ask about USMLE status (Step 1 and Step 2)
4. CAREER: Ask about specialty interests and career goals
5. LEARNING: Ask about study habits, learning style, weak areas
6. CONTACT: Ask for location (country, city) and phone for reminders
7. COMPLETE: Summarize their profile and let them know next step is document upload

When transitioning between sections, be natural. For example:
- "Great! Now let's talk about your career aspirations..."
- "Perfect, I've noted that. Moving on to your study preferences..."

Remember: You're helping future doctors feel welcomed to the platform!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, conversationId } = await req.json();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data, error } = await supabase
        .from("onboarding_conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      conversation = data;
    } else {
      // Create new conversation
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      const welcomeMessage = {
        role: "assistant",
        content: `Hi ${profile?.first_name || 'there'}! 👋 Welcome to Livemed Learning! I'm here to help you complete your student profile so we can personalize your learning experience.\n\nThis will only take a few minutes, and everything you share helps us tailor your curriculum and connect you with the right opportunities.\n\nLet's start with your academic background. **Which medical school are you currently attending?**`
      };

      const { data, error } = await supabase
        .from("onboarding_conversations")
        .insert({
          user_id: user.id,
          messages: [welcomeMessage],
          current_step: 'academic_info',
          extracted_data: {}
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        return new Response(JSON.stringify({ error: "Failed to create conversation" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        conversationId: data.id,
        message: welcomeMessage,
        currentStep: 'academic_info'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add user message to conversation
    const messages = [...(conversation.messages as any[]), { role: "user", content: message }];

    // Get current profile data for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Build context for AI
    const contextMessage = `Current conversation step: ${conversation.current_step}
Already collected data: ${JSON.stringify(conversation.extracted_data)}
Student name: ${profile?.first_name || 'Student'} ${profile?.last_name || ''}
`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let assistantContent = aiData.choices?.[0]?.message?.content || "I'm sorry, I didn't understand that. Could you please rephrase?";

    // Extract any data from the response
    let extractedData: ExtractedData = { ...(conversation.extracted_data as ExtractedData) };
    const dataMatch = assistantContent.match(/<<<EXTRACTED_DATA>>>(.*?)<<<END_DATA>>>/s);
    if (dataMatch) {
      try {
        const newData = JSON.parse(dataMatch[1]);
        extractedData = { ...extractedData, ...newData };
        // Remove the data block from the visible message
        assistantContent = assistantContent.replace(/<<<EXTRACTED_DATA>>>.*?<<<END_DATA>>>/s, '').trim();
      } catch (e) {
        console.error("Failed to parse extracted data:", e);
      }
    }

    // Determine next step based on content and extracted data
    let currentStep = conversation.current_step;
    const hasAcademic = extractedData.institution && extractedData.year_of_study;
    const hasCareer = extractedData.target_specialty || extractedData.career_goals;
    const hasLearning = extractedData.learning_style || extractedData.study_hours_per_week;
    const hasContact = extractedData.country && extractedData.city;

    if (currentStep === 'academic_info' && hasAcademic) {
      currentStep = 'career_goals';
    } else if (currentStep === 'career_goals' && hasCareer) {
      currentStep = 'learning_preferences';
    } else if (currentStep === 'learning_preferences' && hasLearning) {
      currentStep = 'contact_location';
    } else if (currentStep === 'contact_location' && hasContact) {
      currentStep = 'document_upload';
    }

    // Check if onboarding is ready for document upload
    const isReadyForDocuments = currentStep === 'document_upload' || 
      (hasAcademic && hasContact);

    // Update conversation
    const updatedMessages = [...messages, { role: "assistant", content: assistantContent }];
    
    await supabase
      .from("onboarding_conversations")
      .update({
        messages: updatedMessages,
        current_step: currentStep,
        extracted_data: extractedData
      })
      .eq("id", conversation.id);

    // Update profile with extracted data
    if (Object.keys(extractedData).length > 0) {
      const profileUpdate: any = {};
      
      if (extractedData.institution) profileUpdate.institution = extractedData.institution;
      if (extractedData.country) profileUpdate.country = extractedData.country;
      if (extractedData.year_of_study) profileUpdate.year_of_study = parseInt(extractedData.year_of_study);
      if (extractedData.medical_school_type) profileUpdate.medical_school_type = extractedData.medical_school_type;
      if (extractedData.expected_graduation) profileUpdate.expected_graduation = extractedData.expected_graduation;
      if (extractedData.target_specialty) profileUpdate.target_specialty = extractedData.target_specialty;
      if (extractedData.usmle_step1_status) profileUpdate.usmle_step1_status = extractedData.usmle_step1_status;
      if (extractedData.usmle_step1_score) profileUpdate.usmle_step1_score = parseInt(extractedData.usmle_step1_score);
      if (extractedData.usmle_step2_status) profileUpdate.usmle_step2_status = extractedData.usmle_step2_status;
      if (extractedData.usmle_step2_score) profileUpdate.usmle_step2_score = parseInt(extractedData.usmle_step2_score);
      if (extractedData.career_goals) profileUpdate.career_goals = extractedData.career_goals;
      if (extractedData.study_hours_per_week) profileUpdate.study_hours_per_week = parseInt(extractedData.study_hours_per_week);
      if (extractedData.learning_style) profileUpdate.learning_style = extractedData.learning_style;
      if (extractedData.weak_areas) profileUpdate.weak_areas = extractedData.weak_areas;
      if (extractedData.city) profileUpdate.city = extractedData.city;
      if (extractedData.state_province) profileUpdate.state_province = extractedData.state_province;
      if (extractedData.address_line1) profileUpdate.address_line1 = extractedData.address_line1;
      if (extractedData.phone_number) profileUpdate.phone_number = extractedData.phone_number;

      if (Object.keys(profileUpdate).length > 0) {
        await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", user.id);
      }
    }

    return new Response(JSON.stringify({
      conversationId: conversation.id,
      message: { role: "assistant", content: assistantContent },
      currentStep,
      extractedData,
      isReadyForDocuments
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Onboarding chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
