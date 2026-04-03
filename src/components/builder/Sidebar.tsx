import { Plus, Trash2, MessageSquare, Code, MoreVertical, Edit2, Copy, Search, Star, Users, FolderOpen, Home, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  onHome?: () => void;
  mode: AppMode;
}

const modeConfig: Record<AppMode, { label: string; icon: React.ReactNode; newLabel: string }> = {
  chat: { label: "Chats", icon: <MessageSquare size={13} />, newLabel: "New Chat" },
  builder: { label: "Projects", icon: <Code size={13} />, newLabel: "New Project" },
};

type FilterType = "all" | "starred" | "recent";

export function Sidebar({ projects, activeId, onSelect, onNew, onDelete, onRename, onDuplicate, onLogout, onProfile, onHome, mode }: SidebarProps) {
  const config = modeConfig[mode];
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [userInitials, setUserInitials] = useState("?");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [starredIds, setStarredIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("gimi-starred-projects");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

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

  const toggleStar = (id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("gimi-starred-projects", JSON.stringify([...next]));
      return next;
    });
  };

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (filter === "starred") list = list.filter(p => starredIds.has(p.id));
    if (filter === "recent") list = list.slice(0, 10);
    return list;
  }, [projects, searchQuery, filter, starredIds]);

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
    <div className="flex flex-col h-full w-[280px] glass-sidebar border-r border-border/40 flex-shrink-0">
      {/* Search */}
      <div className="p-3 border-b border-border/30">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects"
            className="w-full pl-9 pr-8 py-2 text-sm bg-muted/50 rounded-xl border border-border/40 focus:outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground/50 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Home */}
      <div className="px-2 pt-2">
        <button
          onClick={onHome}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <Home size={15} />
          <span className="font-medium">Home</span>
        </button>
      </div>

      {/* Recent project */}
      {projects.length > 0 && projects[0].messages.length > 0 && (
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider px-1 mb-1.5">Recent</p>
          <button
            onClick={() => { onNew(); }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm border border-border/40 hover:bg-muted/60 transition-all"
          >
            <Plus size={15} className="text-muted-foreground" />
            <span className="font-medium text-foreground">Create new project</span>
          </button>
          <div
            className={`flex items-center gap-2.5 mt-1 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${
              projects[0].id === activeId ? "bg-primary/8 border border-primary/15" : "hover:bg-muted/60 border border-transparent"
            }`}
            onClick={() => onSelect(projects[0].id)}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center shrink-0">
              <img src={hexaIcon} alt="" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{projects[0].name}</p>
              <p className="text-[10px] text-muted-foreground">just now</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider px-1 mb-2">{config.label}</p>
        <div className="flex flex-col gap-0.5">
          {[
            { key: "all" as FilterType, icon: <FolderOpen size={14} />, label: "All projects" },
            { key: "starred" as FilterType, icon: <Star size={14} />, label: "Starred" },
            { key: "recent" as FilterType, icon: <Users size={14} />, label: "Created by me" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs transition-all ${
                filter === f.key ? "bg-muted/80 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 space-y-0.5 scrollbar-thin">
        {filteredProjects.map((p) => (
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

            {/* Star button */}
            {renaming !== p.id && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(p.id); }}
                className={`transition-all p-0.5 rounded-md ${
                  starredIds.has(p.id) ? "text-amber-500 opacity-100" : "opacity-0 group-hover:opacity-40 hover:!opacity-100 text-muted-foreground"
                }`}
              >
                <Star size={12} fill={starredIds.has(p.id) ? "currentColor" : "none"} />
              </button>
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
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(p.id); setMenuOpen(null); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-popover-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Star size={12} /> {starredIds.has(p.id) ? "Unstar" : "Star"}
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
        {filteredProjects.length === 0 && (
          <p className="text-center text-xs text-muted-foreground/50 py-6">No projects found</p>
        )}
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
