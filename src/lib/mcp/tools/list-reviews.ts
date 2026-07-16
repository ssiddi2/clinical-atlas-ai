import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "list_content_reviews",
  title: "List content reviews",
  description: "List existing review records to check what has already been reviewed and by whom.",
  inputSchema: {
    content_type: z.enum(["qbank_question", "assessment_item", "atlas_conversation", "course_quiz"]).optional(),
    content_id: z.string().optional(),
    verdict: z.enum(["approved", "needs_revision", "rejected", "flagged"]).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    let q = admin(ctx).from("content_reviews").select("*").order("created_at", { ascending: false }).limit(input.limit);
    if (input.content_type) q = q.eq("content_type", input.content_type);
    if (input.content_id) q = q.eq("content_id", input.content_id);
    if (input.verdict) q = q.eq("verdict", input.verdict);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify({ count: data?.length ?? 0, reviews: data }, null, 2) }],
      structuredContent: { reviews: data },
    };
  },
});