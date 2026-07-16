import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "search_content",
  title: "Search QBank content",
  description: "Full-text search QBank stems, explanations, and topics. Use to find items by concept, drug name, disease, or guideline.",
  inputSchema: {
    query: z.string().min(2).describe("Search phrase."),
    limit: z.number().int().min(1).max(50).default(15),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    const like = `%${query.replace(/[%_]/g, "\\$&")}%`;
    const { data, error } = await admin(ctx)
      .from("qbank_questions")
      .select("id, question_id, subject, system, difficulty, stem, first_aid_reference")
      .eq("is_active", true)
      .or(`stem.ilike.${like},explanation.ilike.${like},topic.ilike.${like}`)
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = (data ?? []).map((r) => ({ ...r, stem_preview: r.stem.slice(0, 180) }));
    return {
      content: [{ type: "text", text: JSON.stringify({ count: rows.length, matches: rows.map(({ stem, ...rest }) => rest) }, null, 2) }],
      structuredContent: { matches: rows },
    };
  },
});