import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/builder/Sidebar";
import { Header } from "@/components/builder/Header";
import { ChatInput } from "@/components/builder/ChatInput";
import { ChatPane } from "@/components/builder/ChatPane";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { streamChat, extractHtml } from "@/lib/ai-stream";
import {
  loadProjectsFromCloud,
  saveProjectToCloud,
  saveMessageToCloud,
  deleteProjectFromCloud,
  createProjectInCloud,
  loadActiveId,
  saveActiveId,
  createProject,
  type Project,
} from "@/lib/storage";
import { toast } from "sonner";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [view, setView] = useState<"chat" | "preview" | "code">("chat");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const active = projects.find((p) => p.id === activeId) || projects[0];

  // Load from cloud on mount
  useEffect(() => {
    async function init() {
      try {
        let cloudProjects = await loadProjectsFromCloud();
        if (cloudProjects.length === 0) {
          const p = await createProjectInCloud("My First Project");
          cloudProjects = [p];
        }
        setProjects(cloudProjects);
        const savedId = loadActiveId();
        const validId = cloudProjects.find((p) => p.id === savedId)?.id || cloudProjects[0]?.id;
        setActiveId(validId || "");
      } catch (err) {
        console.error("Failed to load from cloud, using local:", err);
        const p = createProject("My First Project");
        setProjects([p]);
        setActiveId(p.id);
      }
      setIsInitialized(true);
    }
    init();
  }, []);

  // Persist active ID
  useEffect(() => {
    if (activeId) saveActiveId(activeId);
  }, [activeId]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const handleNew = async () => {
    try {
      const p = await createProjectInCloud();
      setProjects((prev) => [p, ...prev]);
      setActiveId(p.id);
      setShowSidebar(false);
      setView("chat");
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectFromCloud(id);
      const next = projects.filter((p) => p.id !== id);
      if (next.length === 0) {
        const p = await createProjectInCloud("My First Project");
        setProjects([p]);
        setActiveId(p.id);
      } else {
        setProjects(next);
        if (activeId === id) setActiveId(next[0].id);
      }
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleSend = async (text: string) => {
    if (!active) return;

    const userMsg = { role: "user" as const, content: text };
    const newMessages = [...active.messages, userMsg];
    const newName = active.messages.length === 0 ? text.slice(0, 40) : active.name;
    
    updateProject(active.id, { messages: newMessages, name: newName });
    setLoading(true);
    setStreamingContent("");

    // Save user message to cloud
    try {
      await saveMessageToCloud(active.id, "user", text);
      if (newName !== active.name) {
        await saveProjectToCloud({ ...active, name: newName });
      }
    } catch (err) {
      console.error("Failed to save message to cloud:", err);
    }

    let fullContent = "";

    try {
      await streamChat({
        messages: newMessages,
        onDelta: (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        onDone: async () => {
          const html = extractHtml(fullContent);
          const finalMessages = [
            ...newMessages,
            { role: "assistant" as const, content: fullContent },
          ];
          updateProject(active.id, { messages: finalMessages, html });
          setStreamingContent("");
          setLoading(false);

          // Save assistant message to cloud
          try {
            await saveMessageToCloud(active.id, "assistant", fullContent);
            await saveProjectToCloud({ ...active, html, name: newName });
          } catch (err) {
            console.error("Failed to save to cloud:", err);
          }

          // Auto-switch to preview only if HTML was generated
          if (html && html.trim().match(/^(<(!DOCTYPE|html))/i)) {
            setView("preview");
          }
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      updateProject(active.id, { messages: active.messages });
      setStreamingContent("");
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!active?.html) return;
    const blob = new Blob([active.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build messages list including streaming message
  const displayMessages = active?.messages || [];
  const allMessages = streamingContent
    ? [...displayMessages, { role: "assistant" as const, content: streamingContent }]
    : displayMessages;

  if (!isInitialized) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Mobile overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static z-50 h-full transition-transform lg:translate-x-0 ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar
          projects={projects}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setShowSidebar(false); setView("chat"); }}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          view={view}
          onViewChange={setView}
          onDownload={handleDownload}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
        />
        {view === "chat" ? (
          <ChatPane
            messages={allMessages}
            loading={loading && !streamingContent}
            onSuggestionClick={handleSend}
          />
        ) : (
          <PreviewPane html={active?.html || ""} view={view} />
        )}
        <ChatInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
