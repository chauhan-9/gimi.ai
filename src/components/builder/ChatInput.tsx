import { Send } from "lucide-react";
import { useState, useRef } from "react";

interface ChatInputProps {
  onSend: (msg: string) => void;
  loading: boolean;
}

export function ChatInput({ onSend, loading }: ChatInputProps) {
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
    <div className="flex items-end gap-2 p-3 bg-builder-footer border-t border-border flex-shrink-0">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Describe what you want to build..."
        rows={1}
        className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={loading}
      />
      <button
        onClick={handleSend}
        disabled={loading || !text.trim()}
        className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground p-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? (
          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </div>
  );
}
