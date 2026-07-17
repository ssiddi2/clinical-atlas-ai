import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteStudent {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface InviteResult {
  email: string;
  success: boolean;
  tempPassword?: string;
  error?: string;
  alreadyExists?: boolean;
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd + "!9";
}

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is physician, faculty, or platform_admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const allowedRoles = new Set(["physician", "faculty", "platform_admin"]);
    const isAllowed = roles?.some((r: any) => allowedRoles.has(r.role));
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Unauthorized: physician/faculty access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { courseId, students } = body as { courseId: string; students: InviteStudent[] };

    if (!courseId || !Array.isArray(students) || students.length === 0) {
      return new Response(JSON.stringify({ error: "courseId and students[] are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (students.length > 100) {
      return new Response(JSON.stringify({ error: "Maximum 100 students per invite batch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller owns the course (or is admin)
    const isAdmin = roles?.some((r: any) => r.role === "platform_admin");
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("id, instructor_id, title")
      .eq("id", courseId)
      .single();

    if (courseErr || !course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin && course.instructor_id !== user.id) {
      return new Response(JSON.stringify({ error: "You don't own this course" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const results: InviteResult[] = [];

    for (const s of students) {
      const email = (s.email || "").trim().toLowerCase();
      if (!emailRegex.test(email)) {
        results.push({ email, success: false, error: "Invalid email" });
        continue;
      }

      try {
        // Check if user exists by attempting to find them
        const { data: existing } = await supabase.auth.admin.listUsers();
        const existingUser = existing?.users?.find((u: any) => u.email?.toLowerCase() === email);

        let userId: string;
        let tempPassword: string | undefined;

        if (existingUser) {
          userId = existingUser.id;
          // Ensure profile is approved
          await supabase
            .from("profiles")
            .update({ account_status: "approved" })
            .eq("user_id", userId);

          results.push({ email, success: true, alreadyExists: true });
        } else {
          tempPassword = generateTempPassword();
          const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              first_name: s.firstName || "",
              last_name: s.lastName || "",
            },
          });

          if (createErr || !newUser?.user) {
            results.push({ email, success: false, error: createErr?.message || "Failed to create user" });
            continue;
          }

          userId = newUser.user.id;

          // Profile may have been created by trigger; upsert
          await supabase.from("profiles").upsert({
            user_id: userId,
            first_name: s.firstName || null,
            last_name: s.lastName || null,
            account_status: "approved",
            verification_status: "pending",
            membership_tier: "learner",
          }, { onConflict: "user_id" });

          // Ensure student role
          await supabase.from("user_roles").upsert({
            user_id: userId,
            role: "student",
            granted_by: user.id,
          }, { onConflict: "user_id,role" });
        }

        // Create pending invitation (student must accept)
        const { data: existingEnroll } = await supabase
          .from("course_enrollments")
          .select("id, status")
          .eq("course_id", courseId)
          .eq("student_id", userId)
          .maybeSingle();

        if (!existingEnroll) {
          await supabase.from("course_enrollments").insert({
            course_id: courseId,
            student_id: userId,
            status: "invited",
          });
        } else if (existingEnroll.status === "declined" || existingEnroll.status === "pending") {
          await supabase
            .from("course_enrollments")
            .update({ status: "invited", approved_at: null })
            .eq("id", existingEnroll.id);
        }

        // Notify the student with an actionable invitation
        await supabase.from("notifications").insert({
          user_id: userId,
          title: `Course invitation: ${course.title}`,
          message: `Your instructor has invited you to join ${course.title}. Open the course to accept or decline.`,
          type: "info",
          link: `/courses/${courseId}?invite=1`,
        });

        results[results.length - 1] = results[results.length - 1] || { email, success: true };
        if (!existingUser) {
          results.push({ email, success: true, tempPassword });
        }
      } catch (e: any) {
        console.error("Invite error for", email, e);
        results.push({ email, success: false, error: e?.message || "Unknown error" });
      }
    }

    const summary = {
      total: students.length,
      created: results.filter(r => r.success && !r.alreadyExists).length,
      enrolled: results.filter(r => r.success && r.alreadyExists).length,
      failed: results.filter(r => !r.success).length,
    };

    return new Response(JSON.stringify({ success: true, summary, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("physician-invite-students error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
