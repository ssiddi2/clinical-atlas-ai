import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function admin(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireAdmin(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) return "Not authenticated";
  const sb = admin(ctx);
  const { data, error } = await sb.rpc("has_role", { _user_id: ctx.getUserId(), _role: "platform_admin" });
  if (error) return error.message;
  if (!data) return "Platform admin role required to review content.";
  return null;
}

export { admin, requireAdmin };

export default defineTool({
  name: "list_qbank_questions",
  title: "List QBank questions",
  description: "List QBank vignettes for review. Filter by specialty, subject, system, difficulty. Returns id, question_id, subject, system, difficulty, stem preview.",
  inputSchema: {
    subject: z.string().optional().describe("Filter by subject (e.g. 'Cardiology')."),
    system: z.string().optional().describe("Filter by organ system."),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    limit: z.number().int().min(1).max(100).default(25),
    offset: z.number().int().min(0).default(0),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    let q = admin(ctx)
      .from("qbank_questions")
      .select("id, question_id, subject, system, difficulty, stem, first_aid_reference, is_active")
      .eq("is_active", true)
      .order("question_id")
      .range(input.offset, input.offset + input.limit - 1);
    if (input.subject) q = q.eq("subject", input.subject);
    if (input.system) q = q.eq("system", input.system);
    if (input.difficulty) q = q.eq("difficulty", input.difficulty);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = (data ?? []).map((r) => ({ ...r, stem_preview: r.stem.slice(0, 200) }));
    return {
      content: [{ type: "text", text: JSON.stringify({ count: rows.length, questions: rows.map(({ stem, ...rest }) => rest) }, null, 2) }],
      structuredContent: { questions: rows },
    };
  },
});