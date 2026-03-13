import { ArrowLeft, Download, Menu, Globe, Sparkles, Zap } from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";
import type { AppMode } from "@/lib/storage";

export type View = "chat" | "tools" | "preview" | "code";

export interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onDownload: () => void;
  onToggleSidebar: () => void;
  onBack?: () => void;
  appMode?: AppMode | null;
  onPublish?: () => void;
  onTemplates?: () => void;
  onAITools?: () => void;
}

export function Header({ view, onViewChange, onDownload, onToggleSidebar, onBack, appMode, onPublish, onTemplates, onAITools }: HeaderProps) {
  const tabs: { key: View; label: string }[] =
    appMode === "builder"
      ? [
          { key: "chat", label: "Chat" },
          { key: "preview", label: "Preview" },
          { key: "code", label: "Code" },
        ]
      : [];

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border flex-shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <button onClick={onToggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img src={hexaIcon} alt="Gimi.AI" className="w-7 h-7 rounded-lg" />
          <span className="text-sm font-bold font-display gradient-text tracking-tight">
            {appMode === "chat" ? "Chat" : appMode === "builder" ? "Builder" : "gimi.ai"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tabs.length > 0 && (
          <div className="flex items-center bg-muted rounded-xl p-1">
            {tabs.map((tab) => (
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
        )}

        {appMode === "builder" && (
          <div className="flex items-center gap-1">
            <button
              onClick={onTemplates}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Templates"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Templates</span>
            </button>
            <button
              onClick={onAITools}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="AI Tools"
            >
              <Zap size={14} />
              <span className="hidden sm:inline">AI Tools</span>
            </button>
            <button
              onClick={onPublish}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">Publish</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5"
            >
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
