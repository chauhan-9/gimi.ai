import { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Box } from "lucide-react";
import { toast } from "sonner";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
  onOpen3D?: () => void;
}

export function ImageLightbox({ src, alt, onClose, onOpen3D }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `hexa-image-${Date.now()}.png`;
    link.click();
    toast.success("Download started!");
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-md animate-in fade-in-0 duration-200">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-2 py-1.5 shadow-lg z-10">
        <button onClick={zoomIn} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Zoom in">
          <ZoomIn size={18} />
        </button>
        <button onClick={zoomOut} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Zoom out">
          <ZoomOut size={18} />
        </button>
        <button onClick={resetZoom} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Reset zoom">
          <RotateCcw size={18} />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <span className="text-xs text-muted-foreground px-1 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
        <div className="w-px h-6 bg-border mx-1" />
        {onOpen3D && (
          <button onClick={onOpen3D} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="View in 3D">
            <Box size={18} />
          </button>
        )}
        <button onClick={handleDownload} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Download">
          <Download size={18} />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Close">
          <X size={18} />
        </button>
      </div>

      {/* Image */}
      <div
        className="overflow-auto max-h-[90vh] max-w-[95vw] cursor-grab active:cursor-grabbing"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <img
          src={src}
          alt={alt || "Image preview"}
          className="rounded-xl shadow-2xl transition-transform duration-200 select-none"
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
          draggable={false}
        />
      </div>
    </div>
  );
}
