import { Send, Plus, MoreHorizontal, Mic, MicOff, Image, FileVideo, Camera, X, Sparkles } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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
}

export function ChatInput({ onSend, loading, suggestions = [], placeholder }: ChatInputProps) {
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
    onSend(trimmed || (attachments.length > 0 ? `[${attachments.length} file(s) attached]` : ""), files.length > 0 ? files : undefined);
    setText("");
    setAttachments([]);
    if (ref.current) ref.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + "px";
    }
  };

  const handleFileSelect = useCallback((accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  }, []);

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const maxSize = 20 * 1024 * 1024;
    const totalAllowed = 10;
    if (attachments.length + files.length > totalAllowed) {
      toast.error(`Maximum ${totalAllowed} files allowed`);
      return;
    }
    const newAttachments: Attachment[] = [];
    for (const file of files) {
      if (file.size > maxSize) { toast.error(`${file.name} is too large (max 20MB)`); continue; }
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) { toast.error(`${file.name} is not supported`); continue; }
      newAttachments.push({ file, preview: URL.createObjectURL(file), type: isVideo ? "video" : "image" });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Speech recognition not supported"); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "hi-IN";
    let finalTranscript = text;
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += (finalTranscript ? " " : "") + transcript;
        else interim = transcript;
      }
      setText(finalTranscript + (interim ? " " + interim : ""));
    };
    recognition.onerror = (event: any) => {
      toast.error("Mic error: " + event.error);
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => { setIsRecording(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success("🎙️ Listening...");
  }, [isRecording, text]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      attachments.forEach((a) => URL.revokeObjectURL(a.preview));
    };
  }, []);

  const canSend = text.trim() || attachments.length > 0;

  return (
    <div className="flex-shrink-0 glass-strong border-t border-border/20">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChosen} />

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="px-3 pt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {attachments.map((att, i) => (
            <div key={i} className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-border/30 glass-card">
              {att.type === "image" ? (
                <img src={att.preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileVideo size={20} className="text-muted-foreground" />
                </div>
              )}
              <button onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3">
        <div className="rounded-2xl glass-card overflow-hidden glow-primary">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder || "Ask Hexa anything..."}
            rows={1}
            className="w-full resize-none px-4 pt-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
            disabled={loading}
          />
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50" disabled={loading}>
                    <Plus size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 glass-strong border-border/30">
                  <DropdownMenuItem onClick={() => handleFileSelect("image/*")}>
                    <Image size={16} className="mr-2 text-purple-400" /> Photo / Screenshot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileSelect("video/*")}>
                    <FileVideo size={16} className="mr-2 text-blue-400" /> Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileSelect("image/*;capture=camera")}>
                    <Camera size={16} className="mr-2 text-pink-400" /> Camera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50" disabled={loading}>
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 glass-strong border-border/30">
                  <DropdownMenuItem onClick={() => { setText(""); setAttachments([]); }}>Clear input</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileSelect("*/*")}>Attach any file</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-xl transition-all ${
                  isRecording
                    ? "bg-destructive/20 text-destructive animate-pulse border border-destructive/30"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                } disabled:opacity-50`}
                disabled={loading}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={handleSend}
                disabled={loading || !canSend}
                className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-30 transition-all glow-primary border border-primary/20"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
