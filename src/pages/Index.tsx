import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/builder/Sidebar";
import { Header } from "@/components/builder/Header";
import { ChatInput } from "@/components/builder/ChatInput";
import { ChatPane } from "@/components/builder/ChatPane";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { streamChat, extractHtml } from "@/lib/ai-stream";
import {
  loadProjects, saveProjects,
  loadActiveId, saveActiveId,
  createProject,
  type Project,
} from "@/lib/storage";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const p = loadProjects();
    return p.length ? p : [createProject("My First Project")];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    return loadActiveId() || projects[0]?.id || "";
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [view, setView] = useState<"chat" | "preview" | "code">("chat");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const active = projects.find((p) => p.id === activeId) || projects[0];

  // Persist
  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { saveActiveId(activeId); }, [activeId]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const handleNew = () => {
    const p = createProject();
    setProjects((prev) => [p, ...prev]);
    setActiveId(p.id);
    setShowSidebar(false);
  };

  const handleDelete = (id: string) => {
    const next = projects.filter((p) => p.id !== id);
    if (next.length === 0) {
      const p = createProject("My First Project");
      setProjects([p]);
      setActiveId(p.id);
    } else {
      setProjects(next);
      if (activeId === id) setActiveId(next[0].id);
    }
  };

  const handleSend = async (text: string) => {
    if (!active) return;

    const userMsg = { role: "user" as const, content: text };
    const newMessages = [...active.messages, userMsg];
    updateProject(active.id, { 
      messages: newMessages,
      name: active.messages.length === 0 ? text.slice(0, 40) : active.name,
    });
    setLoading(true);
    setStreamingContent("");

    let fullContent = "";

    try {
      await streamChat({
        messages: newMessages,
        onDelta: (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        onDone: () => {
          const html = extractHtml(fullContent);
          const finalMessages = [
            ...newMessages,
            { role: "assistant" as const, content: fullContent },
          ];
          updateProject(active.id, {
            messages: finalMessages,
            html,
          });
          setStreamingContent("");
          setLoading(false);
          // Auto-switch to preview when generation is done
          setView("preview");
        },
      });
    } catch (err: any) {
      alert(err.message || "Something went wrong");
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

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Mobile overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static z-50 h-full transition-transform lg:translate-x-0 ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar
          projects={projects}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setShowSidebar(false); }}
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
          <ChatPane messages={allMessages} loading={loading && !streamingContent} />
        ) : (
          <PreviewPane html={active?.html || ""} view={view} />
        )}
        <ChatInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
