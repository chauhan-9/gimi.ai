import { Download, Menu } from "lucide-react";

interface HeaderProps {
  view: "preview" | "code";
  onViewChange: (v: "preview" | "code") => void;
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
        <div className="flex items-center gap-1.5 text-xs">
          <span>🔴</span><span>🟡</span><span>🟢</span>
        </div>
      </div>

      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        <button
          onClick={() => onViewChange("preview")}
          className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
            view === "preview"
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => onViewChange("code")}
          className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
            view === "code"
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Code
        </button>
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
