import { Plus, Trash2, MessageSquare, Code, MoreVertical, Edit2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import type { Project, AppMode } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
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
  onProfile?: () => void;
  mode: AppMode;
}

const modeConfig: Record<AppMode, { label: string; icon: React.ReactNode; newLabel: string }> = {
  chat: { label: "Chats", icon: <MessageSquare size={13} />, newLabel: "New Chat" },
  builder: { label: "Projects", icon: <Code size={13} />, newLabel: "New Project" },
};

export function Sidebar({ projects, activeId, onSelect, onNew, onDelete, onRename, onDuplicate, onLogout, onProfile, mode }: SidebarProps) {
  const config = modeConfig[mode];
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [userInitials, setUserInitials] = useState("?");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", session.user.id).single();
      const name = profile?.display_name || session.user.email?.split("@")[0] || "?";
      setUserDisplayName(name);
      setUserAvatar(profile?.avatar_url || null);
      setUserInitials(name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2));
    }
    loadUser();
  }, []);

  const handleRenameStart = (p: Project) => {
    setRenaming(p.id);
    setRenameValue(p.name);
    setMenuOpen(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim() && onRename) onRename(id, renameValue.trim());
    setRenaming(null);
  };

  return (
    <div className="flex flex-col h-full w-[260px] glass-sidebar border-r border-border/40 flex-shrink-0">
      {/* Header */}
      <div className="p-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/30">
          <img src={hexaIcon} alt="Gimi.AI" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-bold font-display gradient-text leading-tight">Gimi.AI</h1>
          <p className="text-[10px] text-muted-foreground/70">{config.label}</p>
        </div>
      </div>

      {/* New button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 w-full rounded-xl gradient-bg text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-sm glow-sm active:scale-[0.98]"
        >
          <Plus size={15} />
          {config.newLabel}
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin">
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 ${
              p.id === activeId
                ? "bg-primary/8 text-foreground border border-primary/15"
                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
            onClick={() => { if (renaming !== p.id) onSelect(p.id); }}
          >
            <span className={`shrink-0 ${p.id === activeId ? "text-primary" : "text-muted-foreground/60"}`}>{config.icon}</span>

            {renaming === p.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(p.id)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(p.id); if (e.key === "Escape") setRenaming(null); }}
                className="flex-1 text-xs bg-transparent border border-primary/30 rounded-md px-1.5 py-0.5 outline-none focus:border-primary text-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate flex-1 text-xs font-medium">{p.name}</span>
            )}

            {renaming !== p.id && (
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}
                className={`hover:text-foreground transition-all p-0.5 rounded-md hover:bg-muted/80 ${
                  p.id === activeId ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                }`}
              >
                <MoreVertical size={13} />
              </button>
            )}

            {menuOpen === p.id && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(null)} />
                <div className="absolute right-2 top-full mt-1 z-50 w-40 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl py-1 animate-scale-in">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRenameStart(p); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-popover-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Edit2 size={12} /> Rename
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicate(p.id); setMenuOpen(null); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-popover-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Copy size={12} /> Duplicate
                    </button>
                  )}
                  <div className="my-1 border-t border-border/40" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(p.id); setMenuOpen(null); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/8 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* User section */}
      <div className="p-3 border-t border-border/40">
        <button
          onClick={onProfile}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-all duration-200 group"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="" className="w-7 h-7 rounded-lg object-cover ring-1 ring-border/30" />
          ) : (
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground text-[10px] font-bold shadow-sm">
              {userInitials}
            </div>
          )}
          <span className="truncate flex-1 text-left text-xs font-medium">{userDisplayName}</span>
        </button>
      </div>
    </div>
  );
}
