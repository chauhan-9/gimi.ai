import { useEffect, useRef } from "react";
import { Bot, User, Sparkles, Code, MessageCircle, Palette, Globe, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
    icon: <MessageCircle size={20} className="text-primary" />,
    label: "Chat with AI",
    description: "Kisi bhi topic par baat karo",
    prompt: "Hello! Mujhe kuch interesting batao",
  },
  {
    icon: <Code size={20} className="text-primary" />,
    label: "Build an App",
    description: "Website ya app banwao AI se",
    prompt: "Create a beautiful landing page for a tech startup",
  },
  {
    icon: <Palette size={20} className="text-primary" />,
    label: "Design Something",
    description: "Creative design ideas pao",
    prompt: "Design a modern portfolio website with dark theme",
  },
  {
    icon: <Globe size={20} className="text-primary" />,
    label: "Explore Ideas",
    description: "Naye ideas discover karo",
    prompt: "Suggest me some innovative web app ideas for 2026",
  },
  {
    icon: <Zap size={20} className="text-primary" />,
    label: "Quick Actions",
    description: "Fast tasks complete karo",
    prompt: "Create a simple to-do list app with local storage",
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
          {/* Logo / Brand */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
              <span className="text-2xl font-black text-primary tracking-tighter">H</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="text-center space-y-1">
            <p className="text-muted-foreground text-sm">{getGreeting()}! 👋</p>
            <h2 className="text-xl font-semibold text-foreground">What are you curious about?</h2>
          </div>

          {/* Action Cards */}
          <div className="space-y-2.5">
            {ACTION_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(cat.prompt)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm break-words ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                  <ReactMarkdown>{summarizeHtml(msg.content)}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User size={16} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
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
