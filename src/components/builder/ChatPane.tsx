import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Pencil, Trash2, RefreshCw, Code, Palette, Globe, Download, Sparkles, ZoomIn, ArrowDown, Image as ImageIcon, Pen, GraduationCap, Languages, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import hexaIcon from "@/assets/hexa-icon.png";
import { toast } from "sonner";
import { ImageLightbox } from "./ImageLightbox";
import { TypingText } from "./TypingText";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPaneProps {
  messages: Message[];
  loading: boolean;
  appMode?: string;
  userName?: string;
  /** When true, only the LAST assistant message will type out character-by-character (used for streaming). */
  typingAnimationForLastAssistant?: boolean;
  onSuggestionClick?: (text: string) => void;
  onCopy?: (index: number) => void;
  onEdit?: (index: number, newContent: string) => void;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number) => void;
}

const CHAT_SUGGESTIONS = [
  { emoji: "🖼️", label: "Create image", prompt: "A beautiful sunset over mountains with purple and orange sky, realistic photography" },
  { emoji: "✍️", label: "Write anything", prompt: "Mujhe ek professional email likh do for job application in Hindi" },
  { emoji: "💡", label: "Get ideas", prompt: "Mujhe kuch creative business ideas suggest karo for 2026" },
  { emoji: "📚", label: "Help me learn", prompt: "Mujhe Python programming basics sikhao step by step" },
  { emoji: "🎬", label: "Video script", prompt: "Write a YouTube video script on 'Top 10 AI Tools in 2026' with intro, scenes, and outro" },
  { emoji: "🌐", label: "Translate text", prompt: "Translate this to Hindi: The future of AI is incredibly exciting and full of possibilities" },
];

const BUILDER_SUGGESTIONS = [
  { emoji: "🌐", label: "Landing page", prompt: "Create a stunning SaaS product landing page with hero section, features, and pricing" },
  { emoji: "🎨", label: "Portfolio site", prompt: "Design a modern portfolio website with dark theme" },
  { emoji: "📱", label: "Web app banao", prompt: "Create a todo app with dark theme and local storage" },
  { emoji: "🛒", label: "E-commerce page", prompt: "Create a beautiful product showcase page for an online store" },
  { emoji: "📊", label: "Dashboard UI", prompt: "Create an admin dashboard with charts, stats cards, and a sidebar navigation" },
  { emoji: "📝", label: "Blog template", prompt: "Create a clean, minimal blog website with article cards and categories" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function MessageActions({ msg, index, onEdit, onDelete, onRegenerate }: {
  msg: Message; index: number;
  onEdit?: (i: number, c: string) => void;
  onDelete?: (i: number) => void;
  onRegenerate?: (i: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSave = () => {
    if (editText.trim() && editText !== msg.content) onEdit?.(index, editText.trim());
    setEditing(false);
  };

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [editing]);

  if (editing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          ref={editRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full rounded-lg border border-border bg-card p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <div className="flex gap-2">
          <button onClick={handleEditSave} className="px-3 py-1 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90">Save</button>
          <button onClick={() => { setEditing(false); setEditText(msg.content); }} className="px-3 py-1 text-xs rounded-lg bg-muted text-muted-foreground hover:bg-secondary">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={handleCopy} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      {msg.role === "user" && (
        <button onClick={() => { setEditing(true); setEditText(msg.content); }} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
          <Pencil size={13} />
        </button>
      )}
      {msg.role === "assistant" && (
        <button onClick={() => onRegenerate?.(index)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Regenerate">
          <RefreshCw size={13} />
        </button>
      )}
      <button onClick={() => onDelete?.(index)} className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// Animated text component that reveals text word by word
function AnimatedHeadline({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const words = text.split(" ");

  return (
    <span className="inline">
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${i * 80}ms`,
          }}
        >
          {word}{i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

export function ChatPane({ messages, loading, appMode, userName, typingAnimationForLastAssistant, onSuggestionClick, onEdit, onDelete, onRegenerate }: ChatPaneProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const prevMsgCountRef = useRef(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [chipsVisible, setChipsVisible] = useState(false);

  const suggestions = appMode === "builder" ? BUILDER_SUGGESTIONS : CHAT_SUGGESTIONS;
  const greeting = getGreeting();
  const displayName = userName || "";

  useEffect(() => {
    const timer = setTimeout(() => setChipsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    isNearBottomRef.current = nearBottom;
    setShowScrollBtn(!nearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const userMessages = messages.filter(m => m.role === "user");
    const prevCount = prevMsgCountRef.current;
    const newCount = userMessages.length;
    if (newCount > prevCount) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    prevMsgCountRef.current = newCount;
  }, [messages]);

  if (messages.length === 0 && !loading) {
    const headlineChat = "I'm ready to help you create, learn, explore and more.";
    const headlineBuilder = "Let's build something amazing together.";
    const headline = appMode === "builder" ? headlineBuilder : headlineChat;

    return (
      <div className="flex-1 flex flex-col justify-center bg-background px-5 py-8 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-8">
          {/* Greeting */}
          <div className="space-y-3">
            <p
              className="text-muted-foreground text-base transition-all duration-500"
              style={{ opacity: 1 }}
            >
              {greeting}{displayName ? ` ${displayName}` : ""} 👋
            </p>
            <h1 className="text-[1.75rem] md:text-[2.1rem] font-bold text-foreground leading-snug tracking-tight font-display">
              <AnimatedHeadline text={headline} delay={200} />
            </h1>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s.prompt)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 active:scale-95"
                style={{
                  opacity: chipsVisible ? 1 : 0,
                  transform: chipsVisible ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${i * 80}ms`,
                  transitionProperty: "opacity, transform, background-color, border-color",
                  transitionDuration: "400ms, 400ms, 200ms, 200ms",
                }}
              >
                <span className="text-base">{s.emoji}</span>
                <span className="text-sm text-foreground font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`group flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "assistant" && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg overflow-hidden">
                  <img src={hexaIcon} alt="Hexa" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Hexa</span>
              </div>
            )}
            <div className={`max-w-[85%]`}>
              {msg.role === "user" ? (
                <div className="bg-muted/60 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[15px] break-words text-foreground leading-relaxed">
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              ) : (
                <div className="text-[15px] break-words text-foreground leading-[1.85]">
                  {typingAnimationForLastAssistant && i === messages.length - 1 ? (
                    <TypingText text={summarizeHtml(msg.content)} speed={6}>
                      {(displayedText, isComplete) => (
                        <div className="chat-prose prose prose-[15px] max-w-none prose-p:my-3.5 prose-p:leading-[1.85] prose-headings:font-semibold prose-headings:font-display prose-h1:text-[1.25rem] prose-h2:text-[1.15rem] prose-h3:text-[1.05rem] prose-ul:my-4 prose-li:leading-[1.85] prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-5 prose-strong:text-foreground prose-strong:font-semibold prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-pre:bg-muted prose-pre:rounded-xl prose-pre:my-5 prose-hr:my-8 prose-img:rounded-xl prose-img:max-w-full prose-img:shadow-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                          <ReactMarkdown
                            urlTransform={(url) => url}
                            components={{
                              img: ({ src, alt, ...props }) => (
                                <div className="relative inline-block group/img">
                                  <img
                                    src={src}
                                    alt={alt || "Generated image"}
                                    className="rounded-xl max-w-full shadow-lg my-3 border border-border cursor-pointer hover:shadow-xl transition-shadow"
                                    loading="lazy"
                                    onClick={() => setLightboxSrc(src || "")}
                                    {...props}
                                  />
                                  <div className="absolute top-5 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => setLightboxSrc(src || "")}
                                      className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                                      title="Zoom"
                                    >
                                      <ZoomIn size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = src || "";
                                        link.download = `hexa-image-${Date.now()}.png`;
                                        link.click();
                                        toast.success("Download started!");
                                      }}
                                      className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                                      title="Download"
                                    >
                                      <Download size={14} />
                                    </button>
                                  </div>
                                </div>
                              ),
                            }}
                          >{displayedText}</ReactMarkdown>
                          {!isComplete && (
                            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                          )}
                        </div>
                      )}
                    </TypingText>
                  ) : (
                    <div className="chat-prose prose prose-[15px] max-w-none prose-p:my-3.5 prose-p:leading-[1.85] prose-headings:font-semibold prose-headings:font-display prose-h1:text-[1.25rem] prose-h2:text-[1.15rem] prose-h3:text-[1.05rem] prose-ul:my-4 prose-li:leading-[1.85] prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-5 prose-strong:text-foreground prose-strong:font-semibold prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-pre:bg-muted prose-pre:rounded-xl prose-pre:my-5 prose-hr:my-8 prose-img:rounded-xl prose-img:max-w-full prose-img:shadow-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown
                        urlTransform={(url) => url}
                        components={{
                          img: ({ src, alt, ...props }) => (
                            <div className="relative inline-block group/img">
                              <img
                                src={src}
                                alt={alt || "Generated image"}
                                className="rounded-xl max-w-full shadow-lg my-3 border border-border cursor-pointer hover:shadow-xl transition-shadow"
                                loading="lazy"
                                onClick={() => setLightboxSrc(src || "")}
                                {...props}
                              />
                              <div className="absolute top-5 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setLightboxSrc(src || "")}
                                  className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                                  title="Zoom"
                                >
                                  <ZoomIn size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = src || "";
                                    link.download = `hexa-image-${Date.now()}.png`;
                                    link.click();
                                    toast.success("Download started!");
                                  }}
                                  className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                                  title="Download"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            </div>
                          ),
                        }}
                      >{summarizeHtml(msg.content)}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
              <MessageActions msg={msg} index={i} onEdit={onEdit} onDelete={onDelete} onRegenerate={onRegenerate} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden">
              <img src={hexaIcon} alt="Hexa" className="w-full h-full object-cover" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <div className="sticky bottom-3 flex justify-center z-10">
          <button
            onClick={scrollToBottom}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity animate-in fade-in-0 zoom-in-95"
          >
            <ArrowDown size={18} />
          </button>
        </div>
      )}
    </div>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </React.Fragment>
  );
}

function summarizeHtml(content: string): string {
  if (content.includes("![")) return content;
  if (content.length < 300) return content;
  const title = content.match(/<title>(.*?)<\/title>/i)?.[1];
  if (content.trim().match(/^(<(!DOCTYPE|html))/i) || content.includes("```html")) {
    return `✅ Generated webpage${title ? `: "${title}"` : ""} (${content.length} chars)\n\nSwitch to **Preview** or **Code** tab to see the result.`;
  }
  return content;
}
