const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the Lovable AI Gateway and accumulates the streamed reply server-side.
 * Streaming keeps bytes flowing so long reasoning runs survive request timeouts.
 */
export async function completeText(
  messages: { role: string; content: string }[],
  opts: { model?: string } = {},
): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new AiGatewayError(500, "AI is not configured for this project.");

  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? "openai/gpt-5.6-sol",
      messages,
      stream: true,
    }),
  });

  if (!resp.ok || !resp.body) {
    const detail = await resp.text().catch(() => "");
    if (resp.status === 429) throw new AiGatewayError(429, "ATLAS is busy right now. Try again in a moment.");
    if (resp.status === 402) throw new AiGatewayError(402, "AI credits have been exhausted for this workspace.");
    if (resp.status === 403) throw new AiGatewayError(403, "AI access is blocked for this workspace.");
    throw new AiGatewayError(resp.status || 500, detail || "AI request failed.");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let out = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const parsed = JSON.parse(json);
        out += parsed.choices?.[0]?.delta?.content ?? "";
      } catch { /* partial chunk */ }
    }
  }

  return out.trim();
}

/** Extracts the first JSON object/array from a model reply. */
export function parseJsonBlock<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.search(/[[{]/);
  if (start === -1) return null;
  try {
    return JSON.parse(raw.slice(start)) as T;
  } catch {
    return null;
  }
}
