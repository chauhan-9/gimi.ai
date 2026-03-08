import { Plus, Trash2, MessageSquare, Sparkles } from "lucide-react";
import type { Project } from "@/lib/storage";
import hexaIcon from "@/assets/hexa-icon.png";

interface SidebarProps {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ projects, activeId, onSelect, onNew, onDelete }: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-64 bg-card border-r border-border flex-shrink-0">
      {/* Brand */}
      <div className="p-4 flex items-center gap-3">
        <img src={hexaIcon} alt="Hexa.AI" className="w-9 h-9 rounded-xl" />
        <div>
          <h1 className="text-sm font-bold font-display gradient-text">Hexa.AI</h1>
          <p className="text-[10px] text-muted-foreground">AI Assistant</p>
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/20 text-primary py-2.5 text-sm font-medium hover:bg-primary/30 transition-all glow-primary border border-primary/20"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all ${
              p.id === activeId
                ? "glass-card text-foreground glow-primary border border-primary/20"
                : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onSelect(p.id)}
          >
            <MessageSquare size={14} className={p.id === activeId ? "text-primary" : "text-muted-foreground"} />
            <span className="truncate flex-1 text-xs">{p.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/30">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 px-3 py-2">
          <Sparkles size={10} />
          <span>Powered by Hexa.AI</span>
        </div>
      </div>
    </div>
  );
}
