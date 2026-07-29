import type { ToolContext } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";

export function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireRole(
  ctx: ToolContext,
  role: "student" | "physician" | "platform_admin",
) {
  if (!ctx.isAuthenticated()) return "Not authenticated";
  const { data, error } = await sb(ctx).rpc("has_role", { _user_id: ctx.getUserId(), _role: role });
  if (error) return error.message;
  if (!data) return `${role} role required.`;
  return null;
}

export async function requireAuth(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) return "Not authenticated";
  return null;
}

export const errText = (msg: string) => ({ content: [{ type: "text" as const, text: msg }], isError: true });
export const okJson = (label: string, payload: unknown) => ({
  content: [{ type: "text" as const, text: `${label}\n${JSON.stringify(payload, null, 2)}` }],
  structuredContent: payload as Record<string, unknown>,
});