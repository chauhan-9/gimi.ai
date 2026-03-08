import { useState, useRef, useCallback, useEffect } from "react";
import { X, Download } from "lucide-react";
import { toast } from "sonner";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Touch/pinch state
  const touchStateRef = useRef<{
    lastDist: number;
    lastCenter: { x: number; y: number };
    isDragging: boolean;
    startPos: { x: number; y: number };
    startTranslate: { x: number; y: number };
  }>({
    lastDist: 0,
    lastCenter: { x: 0, y: 0 },
    isDragging: false,
    startPos: { x: 0, y: 0 },
    startTranslate: { x: 0, y: 0 },
  });

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `hexa-image-${Date.now()}.png`;
    link.click();
    toast.success("Download started!");
  };

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // --- Mouse wheel zoom ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.max(0.5, Math.min(5, s + delta)));
  }, []);

  // --- Touch gestures (pinch + drag) ---
  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStateRef.current.lastDist = getTouchDist(e.touches);
      touchStateRef.current.lastCenter = getTouchCenter(e.touches);
    } else if (e.touches.length === 1) {
      touchStateRef.current.isDragging = true;
      touchStateRef.current.startPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      touchStateRef.current.startTranslate = { ...translate };
    }
  }, [translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Pinch zoom
      const newDist = getTouchDist(e.touches);
      const ratio = newDist / touchStateRef.current.lastDist;
      setScale((s) => Math.max(0.5, Math.min(5, s * ratio)));
      touchStateRef.current.lastDist = newDist;
    } else if (e.touches.length === 1 && touchStateRef.current.isDragging && scale > 1) {
      // Drag/pan when zoomed in
      const dx = e.touches[0].clientX - touchStateRef.current.startPos.x;
      const dy = e.touches[0].clientY - touchStateRef.current.startPos.y;
      setTranslate({
        x: touchStateRef.current.startTranslate.x + dx,
        y: touchStateRef.current.startTranslate.y + dy,
      });
    }
  }, [scale]);

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.isDragging = false;
  }, []);

  // --- Mouse drag (for desktop) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    touchStateRef.current.isDragging = true;
    touchStateRef.current.startPos = { x: e.clientX, y: e.clientY };
    touchStateRef.current.startTranslate = { ...translate };
  }, [scale, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchStateRef.current.isDragging || scale <= 1) return;
    const dx = e.clientX - touchStateRef.current.startPos.x;
    const dy = e.clientY - touchStateRef.current.startPos.y;
    setTranslate({
      x: touchStateRef.current.startTranslate.x + dx,
      y: touchStateRef.current.startTranslate.y + dy,
    });
  }, [scale]);

  const handleMouseUp = useCallback(() => {
    touchStateRef.current.isDragging = false;
  }, []);

  // Double tap to reset
  const lastTapRef = useRef(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scale !== 1) {
        resetView();
      } else {
        setScale(2);
      }
    }
    lastTapRef.current = now;
  }, [scale]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-foreground/90 backdrop-blur-md animate-in fade-in-0 duration-200">
      {/* Top toolbar - minimal */}
      <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
        <button
          onClick={handleDownload}
          className="p-2.5 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border shadow-lg transition-colors"
          title="Download"
        >
          <Download size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive border border-border shadow-lg transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Zoom indicator */}
      {scale !== 1 && (
        <div className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground shadow-lg">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Image area - full screen touch/gesture zone */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden touch-none select-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (e.target === containerRef.current) {
            handleDoubleTap();
          }
        }}
        style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt || "Image preview"}
          className="max-h-[85vh] max-w-[95vw] rounded-xl shadow-2xl transition-transform duration-100 pointer-events-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center",
          }}
          draggable={false}
          onClick={handleDoubleTap}
        />
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/70 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-[10px] text-muted-foreground">
        👆 Pinch to zoom • Drag to move • Double-tap to reset
      </div>
    </div>
  );
}