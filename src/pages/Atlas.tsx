import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
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

const Atlas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("eli_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
    
    // Auto-select most recent conversation if exists
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

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    const typedMessages: Message[] = (data || []).map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      created_at: msg.created_at,
    }));
    setMessages(typedMessages);
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from("eli_conversations")
      .insert({ user_id: user?.id, title: "New Conversation" })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return;
    }

    setConversations([data, ...conversations]);
    setCurrentConversation(data.id);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    setMessage("");
    setSending(true);

    try {
      // Create conversation if none exists
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
        setConversations([newConv, ...conversations]);
      }

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Save user message to database
      const { error: userMsgError } = await supabase
        .from("eli_messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content: userMessage,
        });

      if (userMsgError) throw userMsgError;

      // Call ATLAS edge function
      const { data: response, error: fnError } = await supabase.functions.invoke("atlas-chat", {
        body: {
          message: userMessage,
          conversationId,
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (fnError) throw fnError;

      // Add assistant response
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from("eli_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: response.reply,
      });

      // Update conversation title if first message
      if (messages.length === 0) {
        await supabase
          .from("eli_conversations")
          .update({ title: userMessage.slice(0, 50) })
          .eq("id", conversationId);
        
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, title: userMessage.slice(0, 50) }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

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
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Conversations */}
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-livemed flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">ATLAS™</h1>
              <p className="text-xs text-muted-foreground">AI Professor</p>
            </div>
          </div>
          <Link to="/dashboard">
            <img src={livemedLogo} alt="Livemed Learning" className="h-14 w-auto" />
          </Link>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full gradient-livemed flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Meet ATLAS™</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Your AI Professor is ready to teach. Ask questions about any medical topic, 
                work through clinical cases, or prepare for your exams.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setMessage(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 text-left text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-accent mb-2" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {sending && (
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

        {/* Input Area */}
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
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
