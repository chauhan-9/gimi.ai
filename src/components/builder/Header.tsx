import { Download, Menu } from "lucide-react";

type View = "chat" | "preview" | "code";

interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onDownload: () => void;
  onToggleSidebar: () => void;
}

export function Header({ view, onViewChange, onDownload, onToggleSidebar }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-builder-header border-b border-border flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold text-foreground tracking-tight">hexa.ai</span>
      </div>

      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        {(["chat", "preview", "code"] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors capitalize ${
              view === v
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
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
