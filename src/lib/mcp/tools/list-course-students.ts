import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errText, okJson, requireRole, sb } from "./_shared";

export default defineTool({
  name: "list_course_students",
  title: "List course students",
  description: "List enrollments for a course. Physician must be the instructor of the course.",
  inputSchema: {
    course_id: z.string().uuid(),
    status: z.enum(["invited", "pending", "approved", "declined", "rejected", "revoked"]).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ course_id, status }, ctx) => {
    const err = await requireRole(ctx, "physician");
    if (err) return errText(err);
    const client = sb(ctx);
    const { data: course, error: cErr } = await client.from("courses").select("id, instructor_id, title").eq("id", course_id).maybeSingle();
    if (cErr) return errText(cErr.message);
    if (!course || course.instructor_id !== ctx.getUserId()) return errText("Not the instructor of this course.");
    let q = client
      .from("course_enrollments")
      .select("id, status, enrolled_at, student_id, profiles:student_id (first_name, last_name)")
      .eq("course_id", course_id)
      .order("enrolled_at", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return errText(error.message);
    return okJson(`Roster for ${course.title} (${data?.length ?? 0})`, { enrollments: data });
  },
});