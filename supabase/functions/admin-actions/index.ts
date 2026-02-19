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
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify platform_admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "platform_admin")
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Unauthorized: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, userId, documentIds, rejectionReason } = await req.json();

    if (!action || !userId) {
      return new Response(JSON.stringify({ error: "action and userId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate action
    const validActions = ["approve_account", "reject_account", "approve_verification", "reject_verification"];
    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    switch (action) {
      case "approve_account": {
        const { error } = await supabase
          .from("profiles")
          .update({ account_status: "approved" })
          .eq("user_id", userId);
        if (error) throw error;
        result = { success: true, message: "Account approved" };
        break;
      }

      case "reject_account": {
        const { error } = await supabase
          .from("profiles")
          .update({ account_status: "suspended" })
          .eq("user_id", userId);
        if (error) throw error;
        result = { success: true, message: "Account suspended" };
        break;
      }

      case "approve_verification": {
        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
          return new Response(JSON.stringify({ error: "documentIds required for verification" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: docError } = await supabase
          .from("student_documents")
          .update({
            status: "approved",
            verified_at: new Date().toISOString(),
            verified_by: user.id,
          })
          .in("id", documentIds);
        if (docError) throw docError;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ verification_status: "verified" })
          .eq("user_id", userId);
        if (profileError) throw profileError;

        result = { success: true, message: "Verification approved" };
        break;
      }

      case "reject_verification": {
        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
          return new Response(JSON.stringify({ error: "documentIds required for verification" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!rejectionReason || typeof rejectionReason !== "string" || !rejectionReason.trim()) {
          return new Response(JSON.stringify({ error: "rejectionReason is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: docError } = await supabase
          .from("student_documents")
          .update({
            status: "rejected",
            verified_at: new Date().toISOString(),
            verified_by: user.id,
            rejection_reason: rejectionReason.trim().slice(0, 1000),
          })
          .in("id", documentIds);
        if (docError) throw docError;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ verification_status: "rejected" })
          .eq("user_id", userId);
        if (profileError) throw profileError;

        result = { success: true, message: "Verification rejected" };
        break;
      }
    }

    console.log(`Admin action: ${action} by admin ${user.id} for user ${userId}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Admin action error:", e);
    return new Response(JSON.stringify({ error: "An error occurred processing the request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
