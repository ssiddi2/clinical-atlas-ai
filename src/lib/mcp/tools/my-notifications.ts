import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errText, okJson, requireAuth, sb } from "./_shared";

export default defineTool({
  name: "my_notifications",
  title: "List my notifications",
  description: "List the signed-in user's notifications, newest first.",
  inputSchema: {
    unread_only: z.boolean().default(false),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ unread_only, limit }, ctx) => {
    const err = await requireAuth(ctx);
    if (err) return errText(err);
    let q = sb(ctx).from("notifications").select("*").eq("user_id", ctx.getUserId()).order("created_at", { ascending: false }).limit(limit);
    if (unread_only) q = q.eq("is_read", false);
    const { data, error } = await q;
    if (error) return errText(error.message);
    return okJson(`Notifications (${data?.length ?? 0})`, { notifications: data });
  },
});