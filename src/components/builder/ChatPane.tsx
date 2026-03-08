import { useEffect, useRef } from "react";
import { Bot, User, Sparkles, Code, MessageCircle, Palette, Globe, Zap, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import hexaIcon from "@/assets/hexa-icon.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPaneProps {
  messages: Message[];
  loading: boolean;
  onSuggestionClick?: (text: string) => void;
}

const ACTION_CATEGORIES = [
  {
    icon: <MessageCircle size={20} />,
    label: "Chat with AI",
    description: "Kisi bhi topic par baat karo",
    prompt: "Hello! Mujhe kuch interesting batao",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: <Code size={20} />,
    label: "Build an App",
    description: "Website ya app banwao AI se",
    prompt: "Create a beautiful landing page for a tech startup",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: <Palette size={20} />,
    label: "Design Something",
    description: "Creative design ideas pao",
    prompt: "Design a modern portfolio website with dark theme",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: <Globe size={20} />,
    label: "Explore Ideas",
    description: "Naye ideas discover karo",
    prompt: "Suggest me some innovative web app ideas for 2026",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: <Cpu size={20} />,
    label: "AI Tools",
    description: "Writer, translator, code generator",
    prompt: "Show me what AI tools you can help me with",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function ChatPane({ messages, loading, onSuggestionClick }: ChatPaneProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-builder-canvas px-4 py-8 overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="flex justify-center animate-float">
            <div className="w-20 h-20 rounded-2xl overflow-hidden glow-primary animate-glow">
              <img src={hexaIcon} alt="Hexa.AI" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Greeting */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">{getGreeting()}! 👋</p>
            <h2 className="text-2xl font-bold font-display gradient-text">What can I help you with?</h2>
            <p className="text-xs text-muted-foreground">Ask me anything — chat, code, design, or explore</p>
          </div>

          {/* Action Cards */}
          <div className="space-y-2.5">
            {ACTION_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(cat.prompt)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl glass-card hover:glow-primary hover:border-primary/30 transition-all text-left group"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className={cat.iconColor}>{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground font-display">{cat.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-builder-canvas">
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl overflow-hidden glow-primary">
                <img src={hexaIcon} alt="Hexa" className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm break-words ${
                msg.role === "user"
                  ? "bg-primary/20 text-foreground rounded-br-md border border-primary/20 glow-primary"
                  : "glass-card text-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-headings:font-display">
                  <ReactMarkdown>{summarizeHtml(msg.content)}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center border border-border/30">
                <User size={14} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl overflow-hidden glow-primary">
              <img src={hexaIcon} alt="Hexa" className="w-full h-full object-cover" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function summarizeHtml(content: string): string {
  if (content.length < 300) return content;
  const title = content.match(/<title>(.*?)<\/title>/i)?.[1];
  if (content.trim().match(/^(<(!DOCTYPE|html))/i) || content.includes("```html")) {
    return `✅ Generated webpage${title ? `: "${title}"` : ""} (${content.length} chars)\n\nSwitch to **Preview** or **Code** tab to see the result.`;
  }
  return content;
}
