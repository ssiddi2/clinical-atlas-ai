import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { admin, requireAdmin } from "./list-qbank-questions";

export default defineTool({
  name: "get_qbank_question",
  title: "Get QBank question",
  description: "Fetch a full QBank vignette including stem, options, correct answer, explanation, First Aid reference. Use to review clinical accuracy against gold-standard sources.",
  inputSchema: {
    question_id: z.string().describe("The public question_id (e.g. 'QB-0042') or UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ question_id }, ctx) => {
    const err = await requireAdmin(ctx);
    if (err) return { content: [{ type: "text", text: err }], isError: true };
    const sb = admin(ctx);
    const isUuid = /^[0-9a-f-]{36}$/i.test(question_id);
    const { data, error } = await sb
      .from("qbank_questions")
      .select("*")
      .eq(isUuid ? "id" : "question_id", question_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Question not found" }], isError: true };
    const opts = (data.options as string[]) ?? [];
    const pretty = [
      `# ${data.question_id} — ${data.subject} / ${data.system} (${data.difficulty})`,
      "",
      "## Stem",
      data.stem,
      "",
      "## Options",
      ...opts.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}${i === data.correct_answer_index ? "  ← CORRECT" : ""}`),
      "",
      "## Explanation",
      data.explanation,
      "",
      data.first_aid_reference ? `**First Aid ref:** ${data.first_aid_reference}` : "",
    ].filter(Boolean).join("\n");
    return {
      content: [{ type: "text", text: pretty }],
      structuredContent: { question: data },
    };
  },
});