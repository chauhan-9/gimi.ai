import React, { useEffect, useRef, useState } from "react";
import { User, Copy, Check, Pencil, Trash2, RefreshCw, Code, MessageCircle, Palette, Globe, Download, Video, Film, Clapperboard, Sparkles, Box, ZoomIn, HelpCircle, Lightbulb, BookOpen, Image as ImageIcon, ArrowDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import hexaIcon from "@/assets/hexa-icon.png";
import { toast } from "sonner";
import { ImageLightbox } from "./ImageLightbox";


interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPaneProps {
  messages: Message[];
  loading: boolean;
  appMode?: string;
  onSuggestionClick?: (text: string) => void;
  onCopy?: (index: number) => void;
  onEdit?: (index: number, newContent: string) => void;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number) => void;
}

const CHAT_CATEGORIES = [
  {
    icon: <MessageCircle size={18} />,
    label: "Kuch bhi pucho",
    description: "Koi bhi sawal ka jawab pao",
    prompt: "Mujhe kuch interesting facts batao jo maine pehle nahi sune honge",
  },
  {
    icon: <HelpCircle size={18} />,
    label: "Sawal ka Jawab",
    description: "Kisi bhi topic pe help lo",
    prompt: "Machine Learning kya hota hai? Simple language mein samjhao",
  },
  {
    icon: <Lightbulb size={18} />,
    label: "Ideas & Suggestions",
    description: "Naye ideas aur suggestions pao",
    prompt: "Mujhe kuch creative business ideas suggest karo for 2026",
  },
  {
    icon: <BookOpen size={18} />,
    label: "Kuch Seekho",
    description: "Koi bhi topic samjho easily",
    prompt: "Mujhe Python programming basics sikhao step by step",
  },
];

const BUILDER_CATEGORIES = [
  {
    icon: <Code size={18} />,
    label: "Build a Website",
    description: "Create any website or app",
    prompt: "Create a beautiful landing page for a tech startup",
  },
  {
    icon: <Palette size={18} />,
    label: "Design Something",
    description: "Get creative design ideas",
    prompt: "Design a modern portfolio website with dark theme",
  },
  {
    icon: <Globe size={18} />,
    label: "Web App Banao",
    description: "Full functional web app create karo",
    prompt: "Create a todo app with dark theme and local storage",
  },
  {
    icon: <Sparkles size={18} />,
    label: "Landing Page",
    description: "Beautiful landing page design",
    prompt: "Create a stunning SaaS product landing page with hero section, features, and pricing",
  },
];

const IMAGE_CATEGORIES = [
  {
    icon: <ImageIcon size={18} />,
    label: "Image Generate karo",
    description: "Koi bhi image create karo",
    prompt: "A beautiful sunset over mountains with purple and orange sky, realistic photography",
  },
  {
    icon: <Palette size={18} />,
    label: "Art & Illustration",
    description: "Creative artwork banao",
    prompt: "A cute cartoon cat sitting on a moon in watercolor style",
  },
  {
    icon: <Sparkles size={18} />,
    label: "Logo Design",
    description: "Professional logo create karo",
    prompt: "A modern minimalist logo for a tech company called 'NexGen' with blue and white colors",
  },
  {
    icon: <Globe size={18} />,
    label: "Realistic Photo",
    description: "Real jaisi photo banao",
    prompt: "A photorealistic image of a futuristic city at night with neon lights and flying cars",
  },
];

const VIDEO_CATEGORIES = [
  {
    icon: <Film size={18} />,
    label: "YouTube Script",
    description: "Complete video script with scenes",
    prompt: "Write a YouTube video script on 'Top 10 AI Tools in 2026' with intro, scenes, and outro",
  },
  {
    icon: <Clapperboard size={18} />,
    label: "Reels / Shorts",
    description: "Short-form video concepts",
    prompt: "Create a 60-second Instagram Reel concept about daily productivity hacks",
  },
  {
    icon: <Video size={18} />,
    label: "Explainer Video",
    description: "Product or concept explainer",
    prompt: "Create a 2-minute explainer video script for a food delivery app",
  },
  {
    icon: <Sparkles size={18} />,
    label: "Video Ideas",
    description: "Trending video concepts",
    prompt: "Suggest 5 trending YouTube video ideas for a tech channel in 2026",
  },
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

export function ChatPane({ messages, loading, appMode, onSuggestionClick, onEdit, onDelete, onRegenerate }: ChatPaneProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const prevMsgCountRef = useRef(0);
  const MODE_CATEGORIES: Record<string, typeof CHAT_CATEGORIES> = {
    chat: CHAT_CATEGORIES,
    builder: BUILDER_CATEGORIES,
    image: IMAGE_CATEGORIES,
    video: VIDEO_CATEGORIES,
  };
  const MODE_TITLES: Record<string, { title: string; subtitle: string }> = {
    chat: { title: "Kuch bhi pucho ya batao!", subtitle: "Koi bhi sawal, topic, ya idea — sab ka jawab milega" },
    builder: { title: "Kya banana hai aaj?", subtitle: "Website, app, ya koi bhi web project create karo" },
    image: { title: "Kaisi image chahiye?", subtitle: "Koi bhi image describe karo aur AI generate karega" },
    video: { title: "Kaunsa video banana hai?", subtitle: "Scripts, storyboards, aur video planning" },
  };
  const categories = MODE_CATEGORIES[appMode || "chat"] || CHAT_CATEGORIES;
  const welcomeTitle = MODE_TITLES[appMode || "chat"]?.title || "Kya help chahiye?";
  const welcomeSubtitle = MODE_TITLES[appMode || "chat"]?.subtitle || "";
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  

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

  // Only auto-scroll when user sends a new message (message count increases with a user message)
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === "user");
    const prevCount = prevMsgCountRef.current;
    const newCount = userMessages.length;
    if (newCount > prevCount) {
      // User just sent a message, scroll to bottom
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    prevMsgCountRef.current = newCount;
  }, [messages]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 py-8 overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <img src={hexaIcon} alt="Hexa.AI" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">{getGreeting()}! 👋</p>
            <h2 className="text-2xl font-bold font-display text-foreground">{welcomeTitle}</h2>
            <p className="text-xs text-muted-foreground">{welcomeSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(cat.prompt)}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all text-center group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{cat.description}</p>
                </div>
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
            <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
              {msg.role === "user" ? (
                <div className="bg-muted/60 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[15px] break-words text-foreground leading-relaxed">
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              ) : (
                <div className="text-[15px] break-words text-foreground leading-relaxed">
                  <div className="prose prose-base max-w-none prose-p:my-1.5 prose-headings:my-2.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:font-display prose-p:leading-relaxed prose-img:rounded-xl prose-img:max-w-full prose-img:shadow-lg">
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

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <div className="relative">
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity animate-in fade-in-0 zoom-in-95"
          >
            <ArrowDown size={18} />
          </button>
        </div>
      )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
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
  // Don't summarize if content contains image markdown
  if (content.includes("![")) return content;
  if (content.length < 300) return content;
  const title = content.match(/<title>(.*?)<\/title>/i)?.[1];
  if (content.trim().match(/^(<(!DOCTYPE|html))/i) || content.includes("```html")) {
    return `✅ Generated webpage${title ? `: "${title}"` : ""} (${content.length} chars)\n\nSwitch to **Preview** or **Code** tab to see the result.`;
  }
  return content;
}
