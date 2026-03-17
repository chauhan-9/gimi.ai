import { ArrowLeft, Download, Menu, Globe, Sparkles, Zap, ChevronDown } from "lucide-react";
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
    <div className="flex items-center justify-between px-4 py-2 glass-strong border-b border-border/60 flex-shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
            <ArrowLeft size={18} />
          </button>
        )}
        <button onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm ring-1 ring-border/40">
            <img src={hexaIcon} alt="Gimi.AI" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold font-display gradient-text tracking-tight">
              {appMode === "chat" ? "Chat" : appMode === "builder" ? "Builder" : "Gimi.AI"}
            </span>
            <ChevronDown size={12} className="text-muted-foreground/60" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {tabs.length > 0 && (
          <div className="flex items-center bg-muted/50 rounded-xl p-0.5 border border-border/40">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onViewChange(tab.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                  view === tab.key
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {appMode === "builder" && (
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={onTemplates}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              title="Templates"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">Templates</span>
            </button>
            <button
              onClick={onAITools}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              title="AI Tools"
            >
              <Zap size={13} />
              <span className="hidden sm:inline">Tools</span>
            </button>
            <button
              onClick={onPublish}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg gradient-bg text-primary-foreground hover:opacity-90 transition-all duration-200 font-semibold shadow-sm glow-sm"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Publish</span>
            </button>
            <button
              onClick={onDownload}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            >
              <Download size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
