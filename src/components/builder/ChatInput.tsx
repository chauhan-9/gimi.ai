import { Send, Plus, MoreHorizontal, MessageSquare, Mic } from "lucide-react";
import { useState, useRef } from "react";

interface ChatInputProps {
  onSend: (msg: string) => void;
  loading: boolean;
  suggestions?: string[];
}

export function ChatInput({ onSend, loading, suggestions = [] }: ChatInputProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="flex-shrink-0 bg-builder-footer border-t border-border">
      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="px-3 pt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 text-xs rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3">
        <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask Lovable..."
            rows={1}
            className="w-full resize-none px-4 pt-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
            disabled={loading}
          />
          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                disabled={loading}
              >
                <Plus size={16} />
              </button>
              <button
                className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                disabled={loading}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {text.trim() ? (
                <button
                  onClick={handleSend}
                  disabled={loading || !text.trim()}
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              ) : (
                <>
                  <button
                    className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    disabled={loading}
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    disabled={loading}
                  >
                    <Mic size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
