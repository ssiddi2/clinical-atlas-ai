import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AtlasMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AtlasConversation {
  id: string;
  title: string | null;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/atlas-chat`;

/** Streams an ATLAS reply over SSE. Shared by /atlas and the dashboard chat pane. */
export async function streamAtlasChat({
  message,
  conversationId,
  history,
  onDelta,
  onDone,
  onError,
}: {
  message: string;
  conversationId: string | null;
  history: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string, type?: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    onError("Please sign in to use ATLAS.");
    return;
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ message, conversationId, history }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    if (resp.status === 429) {
      onError("You're sending messages too quickly. Please wait a moment and try again.", "rate_limited");
    } else if (resp.status === 402) {
      onError("AI credits have been exhausted. Please try again later.", "credits_exhausted");
    } else {
      onError(errorData.message || errorData.error || "Failed to get a response from ATLAS.");
    }
    return;
  }

  if (!resp.body) {
    onError("No response stream received.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

/**
 * Reusable ATLAS chat engine: conversations, message history, streaming send.
 * UI-agnostic so the full page and the dashboard pane share identical behavior.
 */
export function useAtlasChat(userId: string | null | undefined) {
  const [messages, setMessages] = useState<AtlasMessage[]>([]);
  const [conversations, setConversations] = useState<AtlasConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const assistantContentRef = useRef("");
  const messagesRef = useRef<AtlasMessage[]>([]);
  messagesRef.current = messages;

  const loadConversations = useCallback(async (autoSelect = true) => {
    const { data, error } = await supabase
      .from("eli_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return;
    setConversations(data || []);
    if (autoSelect && data && data.length > 0) {
      setCurrentConversation((prev) => prev ?? data[0].id);
    }
  }, []);

  useEffect(() => {
    if (userId) loadConversations();
  }, [userId, loadConversations]);

  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }
    let active = true;
    supabase
      .from("eli_messages")
      .select("*")
      .eq("conversation_id", currentConversation)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active || error) return;
        setMessages((data || []).map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        })));
      });
    return () => { active = false; };
  }, [currentConversation]);

  const newConversation = useCallback(async () => {
    if (messagesRef.current.length === 0) return null;
    const { data, error } = await supabase
      .from("eli_conversations")
      .insert({ user_id: userId, title: "New Conversation" })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return null;
    }
    setConversations((prev) => [data, ...prev]);
    setCurrentConversation(data.id);
    setMessages([]);
    return data.id as string;
  }, [userId]);

  /**
   * Sends a message. `contextPrefix` is invisible framing (e.g. the predictive
   * card the student tapped) prepended to the prompt sent to the model, while
   * `text` is what is shown in the transcript.
   */
  const send = useCallback(async (text: string, contextPrefix?: string) => {
    const userMessage = text.trim();
    if (!userMessage || sending) return;
    setSending(true);
    assistantContentRef.current = "";
    const priorMessages = messagesRef.current;

    try {
      let conversationId = currentConversation;
      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from("eli_conversations")
          .insert({ user_id: userId, title: userMessage.slice(0, 50) })
          .select()
          .single();
        if (convError) throw convError;
        conversationId = newConv.id;
        setCurrentConversation(conversationId);
        setConversations((prev) => [newConv, ...prev]);
      }

      setMessages((prev) => [...prev, {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      }]);

      await supabase.from("eli_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
      });

      const history = priorMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const assistantMsgId = `temp-assistant-${Date.now()}`;
      setStreaming(true);

      await streamAtlasChat({
        message: contextPrefix ? `${contextPrefix}\n\n${userMessage}` : userMessage,
        conversationId,
        history,
        onDelta: (chunk) => {
          assistantContentRef.current += chunk;
          const contentSoFar = assistantContentRef.current;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantMsgId) {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: contentSoFar } : m));
            }
            return [...prev, {
              id: assistantMsgId,
              role: "assistant",
              content: contentSoFar,
              created_at: new Date().toISOString(),
            }];
          });
        },
        onDone: async () => {
          setStreaming(false);
          const finalContent = assistantContentRef.current;
          if (finalContent) {
            await supabase.from("eli_messages").insert({
              conversation_id: conversationId!,
              role: "assistant",
              content: finalContent,
            });
          }
          setSending(false);
        },
        onError: (errorMsg, type) => {
          setStreaming(false);
          const title = type === "rate_limited" ? "Slow down"
            : type === "credits_exhausted" ? "Credits Exhausted"
            : "Error";
          toast({ title, description: errorMsg, variant: "destructive" });
          setSending(false);
        },
      });

      if (priorMessages.length === 0) {
        const title = userMessage.slice(0, 50);
        await supabase.from("eli_conversations").update({ title }).eq("id", conversationId);
        setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, title } : c)));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      setSending(false);
      setStreaming(false);
    }
  }, [sending, currentConversation, userId]);

  return {
    messages,
    conversations,
    currentConversation,
    setCurrentConversation,
    newConversation,
    reloadConversations: loadConversations,
    send,
    sending,
    streaming,
  };
}
