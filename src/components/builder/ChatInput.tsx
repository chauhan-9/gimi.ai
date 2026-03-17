import { Send, Plus, Mic, MicOff, Image, FileVideo, Camera, X } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ModelSelector } from "./ModelSelector";
import type { AppMode } from "@/lib/storage";

interface Attachment {
  file: File;
  preview: string;
  type: "image" | "video";
}

interface ChatInputProps {
  onSend: (msg: string, attachments?: File[]) => void;
  loading: boolean;
  suggestions?: string[];
  placeholder?: string;
  appMode?: AppMode;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function ChatInput({ onSend, loading, placeholder, appMode, selectedModel, onModelChange }: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || loading) return;
    const files = attachments.map((a) => a.file);
    onSend(trimmed || `[${attachments.length} file(s) attached]`, files.length > 0 ? files : undefined);
    setText("");
    setAttachments([]);
    if (ref.current) ref.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + "px";
    }
  };

  const handleFileSelect = useCallback((accept: string) => {
    if (fileInputRef.current) { fileInputRef.current.accept = accept; fileInputRef.current.click(); }
  }, []);

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (attachments.length + files.length > 10) { toast.error("Maximum 10 files allowed"); return; }
    const newAttachments: Attachment[] = [];
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) { toast.error(`${file.name} is too large`); continue; }
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) { toast.error(`${file.name} not supported`); continue; }
      newAttachments.push({ file, preview: URL.createObjectURL(file), type: isVideo ? "video" : "image" });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) { recognitionRef.current?.stop(); recognitionRef.current = null; setIsRecording(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported"); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "hi-IN";
    let finalTranscript = text;
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += (finalTranscript ? " " : "") + t;
        else interim = t;
      }
      setText(finalTranscript + (interim ? " " + interim : ""));
    };
    recognition.onerror = (e: any) => { toast.error("Mic error: " + e.error); setIsRecording(false); };
    recognition.onend = () => { setIsRecording(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success("🎙️ Listening...");
  }, [isRecording, text]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); attachments.forEach((a) => URL.revokeObjectURL(a.preview)); };
  }, []);

  const canSend = text.trim() || attachments.length > 0;

  return (
    <div className="flex-shrink-0 px-3 pb-3 pt-1">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChosen} />

      <div className="max-w-3xl mx-auto">
        {attachments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2 px-1">
            {attachments.map((att, i) => (
              <div key={i} className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-border/50 bg-muted/50 shadow-sm">
                {att.type === "image" ? (
                  <img src={att.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo size={18} className="text-muted-foreground" />
                  </div>
                )}
                <button onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="glass-input rounded-2xl overflow-hidden shadow-sm">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder || "Ask Gimi anything..."}
            rows={1}
            className="w-full resize-none px-4 pt-3.5 pb-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none bg-transparent leading-relaxed"
            disabled={loading}
          />
          <div className="flex items-center justify-between px-2.5 pb-2.5">
            <div className="flex items-center gap-0.5">
              {appMode && selectedModel && onModelChange && (
                <ModelSelector mode={appMode} selectedModel={selectedModel} onModelChange={onModelChange} />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200 disabled:opacity-50" disabled={loading}>
                    <Plus size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44 glass-strong rounded-xl border-border/40">
                  <DropdownMenuItem onClick={() => handleFileSelect("image/*")} className="rounded-lg">
                    <Image size={14} className="mr-2" /> Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileSelect("video/*")} className="rounded-lg">
                    <FileVideo size={14} className="mr-2" /> Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileSelect("image/*;capture=camera")} className="rounded-lg">
                    <Camera size={14} className="mr-2" /> Camera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRecording ? "bg-destructive/10 text-destructive animate-pulse" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
                } disabled:opacity-50`}
                disabled={loading}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={handleSend}
                disabled={loading || !canSend}
                className="p-2 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 disabled:opacity-20 transition-all duration-200 shadow-sm"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-1.5">
          Gimi can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
