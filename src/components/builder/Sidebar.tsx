import { Plus, Trash2, MessageSquare, LogOut, Code, Image, Video, MoreVertical, Edit2, Copy } from "lucide-react";
import { useState } from "react";
import type { Project, AppMode } from "@/lib/storage";
import hexaIcon from "@/assets/hexa-icon.png";

interface SidebarProps {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onDuplicate?: (id: string) => void;
  onLogout: () => void;
  mode: AppMode;
}

const modeConfig: Record<AppMode, { label: string; icon: React.ReactNode; newLabel: string }> = {
  chat: { label: "Chats", icon: <MessageSquare size={14} />, newLabel: "New Chat" },
  builder: { label: "Projects", icon: <Code size={14} />, newLabel: "New Project" },
  image: { label: "Images", icon: <Image size={14} />, newLabel: "New Image" },
  video: { label: "Videos", icon: <Video size={14} />, newLabel: "New Video" },
};

export function Sidebar({ projects, activeId, onSelect, onNew, onDelete, onRename, onDuplicate, onLogout, mode }: SidebarProps) {
  const config = modeConfig[mode];
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRenameStart = (p: Project) => {
    setRenaming(p.id);
    setRenameValue(p.name);
    setMenuOpen(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim() && onRename) {
      onRename(id, renameValue.trim());
    }
    setRenaming(null);
  };

  return (
    <div className="flex flex-col h-full w-64 bg-card border-r border-border flex-shrink-0">
      {/* Brand */}
      <div className="p-4 flex items-center gap-3">
        <img src={hexaIcon} alt="Hexa.AI" className="w-9 h-9 rounded-xl" />
        <div>
          <h1 className="text-sm font-bold font-display gradient-text">Hexa.AI</h1>
          <p className="text-[10px] text-muted-foreground">{config.label}</p>
        </div>
      </div>

      {/* New button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          {config.newLabel}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-hide">
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-colors ${
              p.id === activeId
                ? "bg-primary/10 text-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => { if (renaming !== p.id) onSelect(p.id); }}
          >
            <span className={p.id === activeId ? "text-primary" : "text-muted-foreground"}>{config.icon}</span>

            {renaming === p.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(p.id)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(p.id); if (e.key === "Escape") setRenaming(null); }}
                className="flex-1 text-xs bg-transparent border border-border rounded px-1.5 py-0.5 outline-none focus:border-primary"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate flex-1 text-xs">{p.name}</span>
            )}

            {/* Three-dot menu button */}
            {renaming !== p.id && (
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-all p-0.5 rounded-md hover:bg-muted"
              >
                <MoreVertical size={14} />
              </button>
            )}

            {/* Dropdown menu */}
            {menuOpen === p.id && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(null)} />
                <div className="absolute right-2 top-full mt-1 z-50 w-40 rounded-xl border border-border bg-popover shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRenameStart(p); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Edit2 size={13} />
                    Rename
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicate(p.id); setMenuOpen(null); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-popover-foreground hover:bg-muted transition-colors"
                    >
                      <Copy size={13} />
                      Duplicate
                    </button>
                  )}
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(p.id); setMenuOpen(null); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
