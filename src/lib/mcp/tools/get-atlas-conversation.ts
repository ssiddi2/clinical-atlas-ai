import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "get_atlas_conversation",
  title: "Get ATLAS conversation",
  description: "Fetch a full ATLAS AI tutor conversation (Socratic dialogue) for review of pedagogy and clinical accuracy.",
  inputSchema: {
    conversation_id: z.string().uuid(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ conversation_id }, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    const sb = admin(ctx);
    const { data: convo, error: cErr } = await sb.from("eli_conversations").select("*").eq("id", conversation_id).maybeSingle();
    if (cErr) return { content: [{ type: "text", text: cErr.message }], isError: true };
    if (!convo) return { content: [{ type: "text", text: "Conversation not found" }], isError: true };
    const { data: msgs, error: mErr } = await sb.from("eli_messages").select("role, content, created_at").eq("conversation_id", conversation_id).order("created_at");
    if (mErr) return { content: [{ type: "text", text: mErr.message }], isError: true };
    const transcript = (msgs ?? []).map((m) => `**${m.role.toUpperCase()}:**\n${m.content}`).join("\n\n---\n\n");
    return {
      content: [{ type: "text", text: `# Conversation ${conversation_id}\n\n${transcript}` }],
      structuredContent: { conversation: convo, messages: msgs },
    };
  },
});