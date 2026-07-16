import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "flag_content_for_review",
  title: "Flag content for review",
  description: "Log a review verdict on a QBank question, assessment item, ATLAS conversation, or course quiz. Records reviewer, verdict, severity, sources cross-checked, and notes to the content_reviews audit trail.",
  inputSchema: {
    content_type: z.enum(["qbank_question", "assessment_item", "atlas_conversation", "course_quiz"]),
    content_id: z.string().describe("question_id, UUID, or conversation_id."),
    verdict: z.enum(["approved", "needs_revision", "rejected", "flagged"]),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    reason: z.string().optional().describe("Short category, e.g. 'incorrect answer', 'outdated guideline', 'weak distractors'."),
    sources_checked: z.array(z.string()).default([]).describe("Sources cross-referenced, e.g. ['First Aid 2024 p.312', 'UpToDate: STEMI', 'AHA 2023 guideline']."),
    notes: z.string().optional().describe("Detailed rationale."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    const { data, error } = await admin(ctx)
      .from("content_reviews")
      .insert({
        reviewer_id: ctx.getUserId(),
        content_type: input.content_type,
        content_id: input.content_id,
        verdict: input.verdict,
        severity: input.severity,
        reason: input.reason,
        sources_checked: input.sources_checked,
        notes: input.notes,
        reviewed_via: "mcp",
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Recorded ${input.verdict} (${input.severity}) on ${input.content_type} ${input.content_id}. Review id: ${data.id}` }],
      structuredContent: { review: data },
    };
  },
});