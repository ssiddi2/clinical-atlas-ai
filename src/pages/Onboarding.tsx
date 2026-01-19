import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Send, Loader2, Upload, CheckCircle2, FileText, ArrowRight, Bot, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import livemedLogoIcon from "@/assets/livemed-logo-icon.png";
import DocumentUpload from "@/components/onboarding/DocumentUpload";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STEPS = [
  { id: 'welcome', label: 'Welcome', progress: 0 },
  { id: 'academic_info', label: 'Academic Info', progress: 20 },
  { id: 'career_goals', label: 'Career Goals', progress: 40 },
  { id: 'learning_preferences', label: 'Learning Style', progress: 60 },
  { id: 'contact_location', label: 'Contact Info', progress: 80 },
  { id: 'document_upload', label: 'Verification', progress: 90 },
  { id: 'complete', label: 'Complete', progress: 100 },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("welcome");
  const [isReadyForDocuments, setIsReadyForDocuments] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
        return;
      }

      // Start the conversation
      startConversation();
    };

    if (user) {
      checkOnboardingStatus();
    }
  }, [user, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setMessages([data.message]);
      setCurrentStep(data.currentStep || "academic_info");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start onboarding. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !conversationId) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: userMessage,
            conversationId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setCurrentStep(data.currentStep);
      setIsReadyForDocuments(data.isReadyForDocuments);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDocumentUploadComplete = async () => {
    setDocumentsUploaded(true);
    
    // Mark onboarding as completed
    if (user) {
      await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true,
          verification_status: 'pending'
        })
        .eq("user_id", user.id);
    }
  };

  const handleContinueToDashboard = () => {
    navigate("/dashboard");
  };

  const currentProgress = STEPS.find(s => s.id === currentStep)?.progress || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={livemedLogoIcon} alt="Livemed" className="h-10" />
            <span className="font-semibold text-lg">Livemed Learning</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Complete your profile
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Profile Setup</span>
            <span className="font-medium">{currentProgress}% Complete</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.filter(s => s.id !== 'welcome' && s.id !== 'complete').map((step) => (
              <div 
                key={step.id}
                className={`text-xs ${currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
          {/* Chat Messages */}
          <Card className="flex-1 flex flex-col overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm mb-4">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {sending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Document Upload Section */}
            {isReadyForDocuments && !documentsUploaded && (
              <div className="border-t border-border/40 p-4">
                <DocumentUpload 
                  userId={user?.id || ""} 
                  onUploadComplete={handleDocumentUploadComplete}
                />
              </div>
            )}

            {/* Completion Section */}
            {documentsUploaded && (
              <div className="border-t border-border/40 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Profile Complete!</h3>
                <p className="text-muted-foreground mb-4">
                  Your documents have been submitted for verification. You'll have full access once verified (usually within 24-48 hours).
                </p>
                <Button onClick={handleContinueToDashboard} className="gradient-livemed">
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Input Area */}
            {!isReadyForDocuments && !documentsUploaded && (
              <div className="border-t border-border/40 p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    size="icon"
                    className="gradient-livemed"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          {!isReadyForDocuments && !documentsUploaded && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("I'd prefer to skip this question for now")}
                className="text-xs"
              >
                Skip this question
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs"
              >
                Complete later
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
