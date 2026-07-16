import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "list_atlas_conversations",
  title: "List recent ATLAS conversations",
  description: "List recent ATLAS AI tutor conversations for sampling review.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    const { data, error } = await admin(ctx)
      .from("eli_conversations")
      .select("id, title, user_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify({ count: data?.length ?? 0, conversations: data }, null, 2) }],
      structuredContent: { conversations: data },
    };
  },
});