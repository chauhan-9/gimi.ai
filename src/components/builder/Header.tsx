import { ArrowLeft, Download, Menu, Globe, Sparkles, Zap, ChevronDown, MoreHorizontal, Share2 } from "lucide-react";
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
  onBottomSheet?: () => void;
  projectName?: string;
}

export function Header({ view, onViewChange, onDownload, onToggleSidebar, onBack, appMode, onPublish, onTemplates, onAITools, onBottomSheet, projectName }: HeaderProps) {
  const tabs: { key: View; label: string }[] =
    appMode === "builder"
      ? [
          { key: "chat", label: "Chat" },
          { key: "preview", label: "Preview" },
          { key: "code", label: "Code" },
        ]
      : [];

  return (
    <div className="flex items-center justify-between px-3 py-2 glass-strong border-b border-border/60 flex-shrink-0 z-10">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
            <ArrowLeft size={18} />
          </button>
        )}
        <button onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg overflow-hidden shadow-sm ring-1 ring-border/40">
            <img src={hexaIcon} alt="Gimi.AI" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
            {projectName || (appMode === "chat" ? "Chat" : appMode === "builder" ? "Builder" : "Gimi.AI")}
          </span>
          <ChevronDown size={12} className="text-muted-foreground/60" />
        </div>
      </div>

      {/* Desktop: show tabs inline - Mobile builder: show tabs */}
      <div className="flex items-center gap-1">
        {/* Tabs only shown on mobile for builder mode */}
        {tabs.length > 0 && (
          <div className="flex items-center bg-muted/50 rounded-xl p-0.5 border border-border/40 lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onViewChange(tab.key)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
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
          <div className="flex items-center gap-0.5">
            <button
              onClick={onPublish}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg gradient-bg text-primary-foreground hover:opacity-90 transition-all duration-200 font-semibold shadow-sm glow-sm"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Publish</span>
            </button>
            <button
              onClick={onDownload}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              title="Download"
            >
              <Download size={14} />
            </button>
          </div>
        )}

        {/* Mobile more button */}
        <button
          onClick={onBottomSheet}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
