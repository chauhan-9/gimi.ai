import { useState } from "react";
import { Monitor, Smartphone, Tablet, Maximize2, RefreshCw } from "lucide-react";
import { CodeEditor } from "./CodeEditor";

interface PreviewPaneProps {
  html: string;
  view: "preview" | "code";
}

type DeviceSize = "desktop" | "tablet" | "mobile" | "full";

const deviceConfig: Record<DeviceSize, { width: string; label: string; icon: React.ReactNode }> = {
  full: { width: "100%", label: "Full", icon: <Maximize2 size={14} /> },
  desktop: { width: "1280px", label: "Desktop", icon: <Monitor size={14} /> },
  tablet: { width: "768px", label: "Tablet", icon: <Tablet size={14} /> },
  mobile: { width: "375px", label: "Mobile", icon: <Smartphone size={14} /> },
};

export function PreviewPane({ html, view }: PreviewPaneProps) {
  const [device, setDevice] = useState<DeviceSize>("full");
  const [refreshKey, setRefreshKey] = useState(0);

  if (view === "code") {
    return <CodeEditor html={html} />;
  }

  if (!html) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--builder-canvas))]">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-3">🚀</div>
          <p className="text-lg font-medium">Ready to build</p>
          <p className="text-sm">Describe your website below to get started</p>
        </div>
      </div>
    );
  }

  const config = deviceConfig[device];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(var(--builder-canvas))]">
      {/* Device toolbar */}
      <div className="flex items-center justify-center gap-1 py-2 bg-card/50 border-b border-border shrink-0">
        {(Object.keys(deviceConfig) as DeviceSize[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
              device === d
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={deviceConfig[d].label}
          >
            {deviceConfig[d].icon}
            <span className="hidden sm:inline">{deviceConfig[d].label}</span>
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Preview frame */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          className={`bg-background rounded-lg shadow-lg border border-border overflow-hidden transition-all duration-300 h-full ${
            device === "full" ? "w-full" : ""
          }`}
          style={device !== "full" ? { width: config.width, maxWidth: "100%" } : undefined}
        >
          <iframe
            key={refreshKey}
            srcDoc={html}
            title="Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
