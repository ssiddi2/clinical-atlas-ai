import { defineTool } from "@lovable.dev/mcp-js";
import { errText, okJson, requireRole, sb } from "./_shared";

export default defineTool({
  name: "my_taught_courses",
  title: "List courses I teach",
  description: "List courses where the signed-in physician is the instructor. Requires physician role.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = await requireRole(ctx, "physician");
    if (err) return errText(err);
    const { data, error } = await sb(ctx)
      .from("courses")
      .select("id, title, description, status, created_at, updated_at")
      .eq("instructor_id", ctx.getUserId())
      .order("updated_at", { ascending: false });
    if (error) return errText(error.message);
    return okJson(`Courses (${data?.length ?? 0})`, { courses: data });
  },
});