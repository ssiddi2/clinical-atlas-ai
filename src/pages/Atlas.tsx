import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import {
  Brain,
  Send,
  Plus,
  ArrowLeft,
  Loader2,
  Sparkles,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import livemedLogo from "@/assets/livemed-logo-full.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/atlas-chat`;

async function streamAtlasChat({
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

  // Final flush
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

const Atlas = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const assistantContentRef = useRef("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("eli_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return;
    setConversations(data || []);
    if (data && data.length > 0 && !currentConversation) {
      setCurrentConversation(data[0].id);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("eli_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) return;
    setMessages((data || []).map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      created_at: msg.created_at,
    })));
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from("eli_conversations")
      .insert({ user_id: user?.id, title: "New Conversation" })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return;
    }
    setConversations([data, ...conversations]);
    setCurrentConversation(data.id);
    setMessages([]);
  };

  const sendMessage = useCallback(async () => {
    if (!message.trim() || sending) return;
    const userMessage = message.trim();
    setMessage("");
    setSending(true);
    assistantContentRef.current = "";

    try {
      let conversationId = currentConversation;
      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from("eli_conversations")
          .insert({ user_id: user?.id, title: userMessage.slice(0, 50) })
          .select()
          .single();
        if (convError) throw convError;
        conversationId = newConv.id;
        setCurrentConversation(conversationId);
        setConversations((prev) => [newConv, ...prev]);
      }

      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      await supabase.from("eli_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
      });

      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const assistantMsgId = `temp-assistant-${Date.now()}`;

      await streamAtlasChat({
        message: userMessage,
        conversationId,
        history,
        onDelta: (chunk) => {
          assistantContentRef.current += chunk;
          const contentSoFar = assistantContentRef.current;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantMsgId) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: contentSoFar } : m);
            }
            return [...prev, { id: assistantMsgId, role: "assistant", content: contentSoFar, created_at: new Date().toISOString() }];
          });
        },
        onDone: async () => {
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
          if (type === "rate_limited") {
            toast({ title: "Slow down", description: errorMsg, variant: "destructive" });
          } else if (type === "credits_exhausted") {
            toast({ title: "Credits Exhausted", description: errorMsg, variant: "destructive" });
          } else {
            toast({ title: "Error", description: errorMsg, variant: "destructive" });
          }
          setSending(false);
        },
      });

      if (messages.length === 0) {
        await supabase
          .from("eli_conversations")
          .update({ title: userMessage.slice(0, 50) })
          .eq("id", conversationId);
        setConversations((prev) =>
          prev.map((c) => c.id === conversationId ? { ...c, title: userMessage.slice(0, 50) } : c)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      setSending(false);
    } finally {
      textareaRef.current?.focus();
    }
  }, [message, sending, currentConversation, messages, user, conversations]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const suggestedPrompts = [
    "Explain the pathophysiology of heart failure",
    "What's the differential for chest pain?",
    "Help me understand EKG interpretation",
    "Review USMLE Step 1 cardiology concepts",
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border flex-col bg-muted/30">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <Button onClick={createNewConversation} className="w-full gradient-livemed">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversation(conv.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentConversation === conv.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{conv.title || "New Conversation"}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-3 md:px-4 py-3 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/dashboard" className="md:hidden text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full gradient-livemed flex items-center justify-center">
              <Brain className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm md:text-base">ATLAS™</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Professor</p>
            </div>
          </div>
          <Link to="/dashboard" className="hidden md:block">
            <img src={livemedLogo} alt="Livemed Academy" className="h-10 md:h-16 object-contain" />
          </Link>
        </header>

        <ScrollArea className="flex-1 p-3 md:p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full gradient-livemed flex items-center justify-center mb-4 md:mb-6">
                <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Meet ATLAS™</h2>
              <p className="text-muted-foreground mb-6 md:mb-8 max-w-md text-sm md:text-base">
                Your AI Professor is ready to teach. Ask questions about any medical topic, 
                work through clinical cases, or prepare for your exams.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-lg w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setMessage(prompt); textareaRef.current?.focus(); }}
                    className="p-3 text-left text-xs md:text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-accent mb-2" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 md:gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {sending && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ATLAS anything about medicine..."
                className="min-h-[60px] max-h-[200px] pr-14 resize-none"
                disabled={sending}
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                size="icon"
                className="absolute right-2 bottom-2 gradient-livemed"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ATLAS uses Socratic teaching methodology. Always verify clinical information with authoritative sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atlas;
