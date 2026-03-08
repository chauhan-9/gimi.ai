import { Plus, Settings, Trash2 } from "lucide-react";
import type { Project } from "@/lib/storage";

interface SidebarProps {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({ projects, activeId, onSelect, onNew, onDelete, onOpenSettings }: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-60 bg-sidebar-bg text-sidebar-fg flex-shrink-0">
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
              p.id === activeId
                ? "bg-sidebar-active text-primary-foreground"
                : "hover:bg-sidebar-hover"
            }`}
            onClick={() => onSelect(p.id)}
          >
            <span className="truncate flex-1">{p.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-sm hover:text-primary-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-sidebar-hover"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}
