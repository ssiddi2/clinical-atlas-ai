import { defineTool } from "@lovable.dev/mcp-js";
import { errText, okJson, requireAuth, sb } from "./_shared";

export default defineTool({
  name: "my_courses",
  title: "List my courses",
  description: "List courses the signed-in user is enrolled in (approved, invited, pending, or declined).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = await requireAuth(ctx);
    if (err) return errText(err);
    const { data, error } = await sb(ctx)
      .from("course_enrollments")
      .select("id, status, enrolled_at, courses:course_id (id, title, description, instructor_id, status)")
      .eq("student_id", ctx.getUserId())
      .order("enrolled_at", { ascending: false });
    if (error) return errText(error.message);
    return okJson(`Enrollments (${data?.length ?? 0})`, { enrollments: data });
  },
});