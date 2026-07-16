import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "get_course_quiz",
  title: "Get course quiz",
  description: "Fetch a course quiz (assessment) with all its questions for accuracy review.",
  inputSchema: {
    quiz_id: z.string().uuid(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ quiz_id }, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    const { data, error } = await admin(ctx).from("course_quizzes").select("*").eq("id", quiz_id).maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Quiz not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { quiz: data },
    };
  },
});