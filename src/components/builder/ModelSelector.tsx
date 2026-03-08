import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { ChevronDown, Zap, Brain, Sparkles, Cpu, Image, Video } from "lucide-react";
import type { AppMode } from "@/lib/storage";

export interface ModelOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  speed: "fast" | "balanced" | "powerful";
  free?: boolean;
}

const CHAT_MODELS: ModelOption[] = [
  // Free models
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", description: "Fast & lightweight", icon: <Zap size={14} />, speed: "fast", free: true },
  { id: "openai/gpt-5-nano", label: "GPT-5 Nano", description: "Quick responses", icon: <Zap size={14} />, speed: "fast", free: true },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Good all-rounder", icon: <Sparkles size={14} />, speed: "balanced", free: true },
  // Premium models
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", description: "Fast & capable", icon: <Zap size={14} />, speed: "fast" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Most powerful reasoning", icon: <Brain size={14} />, speed: "powerful" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", description: "Latest reasoning model", icon: <Brain size={14} />, speed: "powerful" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini", description: "Good balance", icon: <Sparkles size={14} />, speed: "balanced" },
  { id: "openai/gpt-5", label: "GPT-5", description: "Powerful all-rounder", icon: <Brain size={14} />, speed: "powerful" },
  { id: "openai/gpt-5.2", label: "GPT-5.2", description: "Enhanced reasoning", icon: <Brain size={14} />, speed: "powerful" },
];

const BUILDER_MODELS: ModelOption[] = [
  // Free models
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", description: "Basic code generation", icon: <Zap size={14} />, speed: "fast", free: true },
  { id: "openai/gpt-5-nano", label: "GPT-5 Nano", description: "Quick code help", icon: <Zap size={14} />, speed: "fast", free: true },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Good code quality", icon: <Sparkles size={14} />, speed: "balanced", free: true },
  // Premium models
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", description: "Fast code generation", icon: <Zap size={14} />, speed: "fast" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Best for complex apps", icon: <Brain size={14} />, speed: "powerful" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", description: "Latest & strongest", icon: <Brain size={14} />, speed: "powerful" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini", description: "Fast & good", icon: <Sparkles size={14} />, speed: "balanced" },
  { id: "openai/gpt-5", label: "GPT-5", description: "Excellent code quality", icon: <Brain size={14} />, speed: "powerful" },
  { id: "openai/gpt-5.2", label: "GPT-5.2", description: "Top-tier reasoning", icon: <Brain size={14} />, speed: "powerful" },
];

const IMAGE_MODELS: ModelOption[] = [
  { id: "google/gemini-2.5-flash-image", label: "Gemini Flash Image", description: "Fast image generation", icon: <Image size={14} />, speed: "fast", free: true },
  { id: "google/gemini-3-pro-image-preview", label: "Gemini 3 Pro Image", description: "Highest quality images", icon: <Image size={14} />, speed: "powerful" },
  { id: "google/gemini-2.5-flash-image-3d", label: "3D Image Creator", description: "Generate 3D-style images", icon: <Cpu size={14} />, speed: "balanced" },
];

const VIDEO_MODELS: ModelOption[] = [
  // Free models
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", description: "Basic video scripts", icon: <Zap size={14} />, speed: "fast", free: true },
  { id: "openai/gpt-5-nano", label: "GPT-5 Nano", description: "Quick video ideas", icon: <Zap size={14} />, speed: "fast", free: true },
  // Premium models
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", description: "Fast video scripts", icon: <Zap size={14} />, speed: "fast" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Detailed storyboards", icon: <Brain size={14} />, speed: "powerful" },
  { id: "openai/gpt-5", label: "GPT-5", description: "Creative scripts", icon: <Brain size={14} />, speed: "powerful" },
  { id: "openai/gpt-5.2", label: "GPT-5.2", description: "Best video planning", icon: <Brain size={14} />, speed: "powerful" },
];

const MODE_MODELS: Record<AppMode, ModelOption[]> = {
  chat: CHAT_MODELS,
  builder: BUILDER_MODELS,
  image: IMAGE_MODELS,
  video: VIDEO_MODELS,
};

const DEFAULT_MODELS: Record<AppMode, string> = {
  chat: "google/gemini-3-flash-preview",
  builder: "google/gemini-3-flash-preview",
  image: "google/gemini-2.5-flash-image",
  video: "google/gemini-3-flash-preview",
};

const STORAGE_KEY = "hexa-selected-models";

export function getStoredModel(mode: AppMode): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[mode]) return parsed[mode];
    }
  } catch {}
  return DEFAULT_MODELS[mode];
}

function saveModel(mode: AppMode, modelId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[mode] = modelId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {}
}

const speedColors: Record<string, string> = {
  fast: "text-green-500",
  balanced: "text-amber-500",
  powerful: "text-primary",
};

const speedLabels: Record<string, string> = {
  fast: "Fast",
  balanced: "Balanced",
  powerful: "Powerful",
};

interface ModelSelectorProps {
  mode: AppMode;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ mode, selectedModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const models = MODE_MODELS[mode];
  const current = models.find((m) => m.id === selectedModel) || models[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = useCallback(() => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top, left: rect.left });
    }
    setOpen(!open);
  }, [open]);

  const handleSelect = (model: ModelOption) => {
    onModelChange(model.id);
    saveModel(mode, model.id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-muted hover:bg-secondary border border-border transition-colors"
      >
        <Cpu size={12} className="text-primary" />
        <span className="text-foreground font-medium truncate max-w-[100px]">{current.label}</span>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", bottom: `${window.innerHeight - pos.top + 8}px`, left: `${pos.left}px` }}
          className="w-64 bg-card border border-border rounded-xl shadow-lg z-[200] py-1.5 max-h-[60vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-border mb-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Select Model</p>
          </div>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelect(model)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors ${
                model.id === selectedModel ? "bg-primary/5" : ""
              }`}
            >
              <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                model.id === selectedModel ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {model.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${model.id === selectedModel ? "text-primary" : "text-foreground"}`}>
                    {model.label}
                  </span>
                  <span className={`text-[9px] font-medium ${speedColors[model.speed]}`}>
                    {speedLabels[model.speed]}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{model.description}</p>
              </div>
              {model.id === selectedModel && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
