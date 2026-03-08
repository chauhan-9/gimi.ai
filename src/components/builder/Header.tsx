import { Download, Menu, Sparkles } from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";

type View = "chat" | "preview" | "code";

interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onDownload: () => void;
  onToggleSidebar: () => void;
}

export function Header({ view, onViewChange, onDownload, onToggleSidebar }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 glass-strong flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img src={hexaIcon} alt="Hexa.AI" className="w-7 h-7 rounded-lg" />
          <span className="text-sm font-bold font-display gradient-text tracking-tight">hexa.ai</span>
        </div>
      </div>

      <div className="flex items-center glass rounded-xl p-1">
        {(["chat", "preview", "code"] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${
              view === v
                ? "bg-primary/20 text-primary glow-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        onClick={onDownload}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Download</span>
      </button>
    </div>
  );
}
