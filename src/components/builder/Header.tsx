import { Download, Menu, Wrench } from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";

export type View = "chat" | "tools" | "preview" | "code";

interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onDownload: () => void;
  onToggleSidebar: () => void;
}

const TABS: { key: View; label: string }[] = [
  { key: "chat", label: "Chat" },
  { key: "tools", label: "Tools" },
  { key: "preview", label: "Preview" },
  { key: "code", label: "Code" },
];

export function Header({ view, onViewChange, onDownload, onToggleSidebar }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img src={hexaIcon} alt="Hexa.AI" className="w-7 h-7 rounded-lg" />
          <span className="text-sm font-bold font-display gradient-text tracking-tight">hexa.ai</span>
        </div>
      </div>

      <div className="flex items-center bg-muted rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onViewChange(tab.key)}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
              view === tab.key
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
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
