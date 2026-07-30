import { defineTool } from "@lovable.dev/mcp-js";
import { errText, okJson, requireAuth, sb } from "./_shared";

export default defineTool({
  name: "my_progress",
  title: "Get my progress",
  description: "Return the signed-in user's latest score predictions and recent assessment attempts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = await requireAuth(ctx);
    if (err) return errText(err);
    const client = sb(ctx);
    const uid = ctx.getUserId();
    const [{ data: predictions }, { data: attempts }] = await Promise.all([
      client.from("usmle_score_predictions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
      client.from("assessment_attempts").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
    ]);
    return okJson("Progress", { score_predictions: predictions, recent_attempts: attempts });
  },
});