import { Share2, Globe, Settings, CreditCard, Palette, Edit2, X } from "lucide-react";
import { useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  onPublish?: () => void;
  onSettings?: () => void;
  onRename?: () => void;
  projectName?: string;
}

export function BottomSheet({ open, onClose, onPublish, onSettings, onRename, projectName }: BottomSheetProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  if (!open) return null;

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border/50 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-5 pb-6 space-y-1">
          {/* Credits */}
          <div className="rounded-2xl border border-border/50 p-4 mb-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Credits</span>
              <span className="text-xs text-primary font-medium">Upgrade &gt;</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">• Daily credits reset at midnight UTC</p>
          </div>

          {/* Menu items */}
          <button onClick={onSettings} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-all">
            <Settings size={18} className="text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </button>

          <button onClick={onRename} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-all">
            <Edit2 size={18} className="text-muted-foreground" />
            <span className="font-medium">Rename project</span>
          </button>

          <button onClick={toggleTheme} className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-all">
            <div className="flex items-center gap-3">
              <Palette size={18} className="text-muted-foreground" />
              <span className="font-medium">Appearance</span>
            </div>
            <span className="text-xs text-muted-foreground">{theme === "light" ? "Light" : "Dark"} &gt;</span>
          </button>

          <button onClick={onPublish} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-all">
            <Globe size={18} className="text-muted-foreground" />
            <span className="font-medium">Publish</span>
          </button>

          <button onClick={() => { navigator.share?.({ title: projectName || "My Project", url: window.location.href }).catch(() => {}); onClose(); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-all">
            <Share2 size={18} className="text-muted-foreground" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>
    </>
  );
}
