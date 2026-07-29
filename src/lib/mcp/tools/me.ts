import { defineTool } from "@lovable.dev/mcp-js";
import { errText, okJson, requireAuth, sb } from "./_shared";

export default defineTool({
  name: "me",
  title: "Get current user",
  description: "Return the signed-in user's profile, roles, and membership tier.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = await requireAuth(ctx);
    if (err) return errText(err);
    const client = sb(ctx);
    const uid = ctx.getUserId();
    const [{ data: profile }, { data: roles }] = await Promise.all([
      client.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      client.from("user_roles").select("role").eq("user_id", uid),
    ]);
    return okJson("Current user", {
      user_id: uid,
      email: ctx.getUserEmail(),
      roles: (roles ?? []).map((r) => r.role),
      profile,
    });
  },
});