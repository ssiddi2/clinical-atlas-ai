import { useEffect, useRef, ReactNode, createContext, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Brain, Bookmark, BookmarkCheck, ExternalLink, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { useAtlasChat } from "./useAtlasChat";

/** What a student can keep from an ATLAS answer and later study. */
export interface ArtifactDraft {
  kind: "image" | "link";
  title: string;
  caption?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
}

/**
 * Lets any surface that renders ATLAS markdown offer "keep this" on the media
 * ATLAS shows. When no provider is present the figures render read-only.
 */
export const ArtifactCaptureContext = createContext<
  ((artifact: ArtifactDraft) => Promise<boolean> | boolean) | null
>(null);

export const ArtifactCaptureProvider = ({
  onSave,
  children,
}: {
  onSave: (artifact: ArtifactDraft) => Promise<boolean> | boolean;
  children: ReactNode;
}) => <ArtifactCaptureContext.Provider value={onSave}>{children}</ArtifactCaptureContext.Provider>;

const KeepButton = ({ artifact }: { artifact: ArtifactDraft }) => {
  const onSave = useContext(ArtifactCaptureContext);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!onSave) return null;

  return (
    <Button
      type="button"
      size="sm"
      variant={saved ? "secondary" : "outline"}
      disabled={busy || saved}
      className="rounded-full h-7 px-2.5 text-xs"
      onClick={async () => {
        setBusy(true);
        const ok = await onSave(artifact);
        setBusy(false);
        if (ok) setSaved(true);
      }}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : saved ? (
        <>
          <BookmarkCheck className="h-3.5 w-3.5 mr-1" /> Kept
        </>
      ) : (
        <>
          <Bookmark className="h-3.5 w-3.5 mr-1" /> Keep &amp; study
        </>
      )}
    </Button>
  );
};

/**
 * Renders ATLAS markdown, including embedded teaching media. Images ATLAS pulls
 * from the web are shown in a framed figure with their caption; links open in a
 * new tab so the student can check the original source. Each figure can be kept
 * as an artifact and later turned into a focused learning session.
 */
export const markdownComponents = {
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    if (!src) return null;
    return (
      <figure className="my-3">
        <a href={src} target="_blank" rel="noopener noreferrer">
          <img
            src={src}
            alt={alt ?? "Clinical teaching image"}
            loading="lazy"
            className="w-full max-h-[420px] rounded-xl border border-border object-contain bg-muted"
          />
        </a>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          {alt ? (
            <figcaption className="text-xs text-muted-foreground">{alt}</figcaption>
          ) : (
            <span />
          )}
          <KeepButton
            artifact={{
              kind: "image",
              title: (alt ?? "Teaching image").slice(0, 160),
              caption: alt ?? null,
              imageUrl: src,
            }}
          />
        </div>
      </figure>
    );
  },
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2"
    >
      {children}
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </a>
  ),
};



export interface AtlasContext {
  /** Short label shown to the student on the composer chip. */
  label: string;
  /** Hidden framing sent to the model with the next message. */
  prompt: string;
}

interface AtlasChatProps {
  chat: ReturnType<typeof useAtlasChat>;
  draft: string;
  onDraftChange: (value: string) => void;
  context?: AtlasContext | null;
  onClearContext?: () => void;
  /** Floating liquid-glass composer (dashboard) vs. docked composer (full page). */
  composer?: "glass" | "docked";
  emptyTitle?: string;
  emptySubtitle?: string;
  suggestions?: string[];
  header?: ReactNode;
  className?: string;
}

const AtlasChat = ({
  chat,
  draft,
  onDraftChange,
  context,
  onClearContext,
  composer = "docked",
  emptyTitle = "Meet ATLAS™",
  emptySubtitle = "Your AI professor. Ask anything, or tap a card to dive in.",
  suggestions = [],
  header,
  className = "",
}: AtlasChatProps) => {
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sending, streaming, send } = chat;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!draft.trim() || sending) return;
    const text = draft;
    onDraftChange("");
    send(text, context?.prompt);
    onClearContext?.();
    textareaRef.current?.focus();
  };

  const isGlass = composer === "glass";

  return (
    <div className={`flex flex-col min-h-0 h-full relative ${className}`}>
      {header}

      <ScrollArea className="flex-1 min-h-0">
        <div className={`px-4 py-4 ${isGlass ? "pb-36" : "pb-4"}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-20">
              <div className="w-16 h-16 rounded-2xl gradient-livemed flex items-center justify-center mb-5">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{emptyTitle}</h2>
              <p className="text-muted-foreground text-sm max-w-sm">{emptySubtitle}</p>
              {suggestions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg w-full">
                  {suggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { onDraftChange(prompt); textareaRef.current?.focus(); }}
                      className="p-3 text-left text-sm rounded-xl border border-border hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown components={markdownComponents as never}>{msg.content}</ReactMarkdown>
                        {streaming && msg.id.startsWith("temp-assistant-") && (
                          <span className="inline-block w-[2px] h-[1em] bg-foreground ml-0.5 align-middle animate-pulse" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {sending && !streaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full gradient-livemed flex items-center justify-center flex-shrink-0">
                    <Brain className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div
        className={
          isGlass
            ? "absolute inset-x-3 bottom-3 md:inset-x-6 md:bottom-5 z-20"
            : "border-t border-border p-4 bg-background"
        }
      >
        <div className={`max-w-3xl mx-auto ${isGlass ? "lm-liquid-glass rounded-[28px] p-2.5" : ""}`}>
          {context && (
            <div className="flex items-center gap-2 mb-2 px-1.5">
              <span className="inline-flex items-center gap-1.5 max-w-full rounded-full bg-accent/10 text-accent px-2.5 py-1 text-xs font-medium">
                <Sparkles className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{context.label}</span>
                <button
                  onClick={onClearContext}
                  aria-label="Clear context"
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask ATLAS anything…"
              className={`resize-none pr-12 ${
                isGlass
                  ? "min-h-[52px] max-h-[160px] bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm"
                  : "min-h-[60px] max-h-[200px]"
              }`}
            />
            <Button
              size="icon"
              onClick={submit}
              disabled={!draft.trim() || sending}
              className="absolute right-2 bottom-2 h-9 w-9 rounded-full gradient-livemed"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasChat;
