import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/builder/Sidebar";
import { Header, type View } from "@/components/builder/Header";
import { ChatInput } from "@/components/builder/ChatInput";
import { ChatPane } from "@/components/builder/ChatPane";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { ToolsDashboard, ToolChatHeader, type AiTool } from "@/components/builder/ToolsDashboard";
import { HomeScreen } from "@/components/builder/HomeScreen";
import type { AppMode } from "@/lib/storage";
import { streamChat, extractHtml, generateImage } from "@/lib/ai-stream";
import {
  loadProjectsFromCloud,
  saveProjectToCloud,
  saveMessageToCloud,
  deleteProjectFromCloud,
  createProjectInCloud,
  replaceMessagesInCloud,
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
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [view, setView] = useState<View>("chat");
  const [activeTool, setActiveTool] = useState<AiTool | null>(null);
  const [toolMessages, setToolMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [toolStreamingContent, setToolStreamingContent] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  const active = projects.find((p) => p.id === activeId) || projects[0];

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth", { replace: true });
    });

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth", { replace: true }); return; }
      setIsInitialized(true);
    }
    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load projects when mode changes
  useEffect(() => {
    if (!isInitialized || !appMode) return;

    async function loadForMode() {
      try {
        let modeProjects = await loadProjectsFromCloud(appMode!);
        if (modeProjects.length === 0) {
          const p = await createProjectInCloud("New Chat", appMode!);
          modeProjects = [p];
        }
        setProjects(modeProjects);
        const savedId = loadActiveId();
        const validId = modeProjects.find((p) => p.id === savedId)?.id || modeProjects[0]?.id;
        setActiveId(validId || "");
      } catch (err) {
        console.error("Failed to load:", err);
        const p = createProject("New Chat", appMode!);
        setProjects([p]);
        setActiveId(p.id);
      }
    }
    loadForMode();
  }, [appMode, isInitialized]);

  useEffect(() => { if (activeId) saveActiveId(activeId); }, [activeId]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const handleNew = async () => {
    if (!appMode) return;
    try {
      const p = await createProjectInCloud(undefined, appMode);
      setProjects((prev) => [p, ...prev]);
      setActiveId(p.id);
      setShowSidebar(false);
      setView("chat");
    } catch { toast.error("Failed to create project"); }
  };

  const handleDelete = async (id: string) => {
    if (!appMode) return;
    try {
      await deleteProjectFromCloud(id);
      const next = projects.filter((p) => p.id !== id);
      if (next.length === 0) {
        const p = await createProjectInCloud("New Chat", appMode);
        setProjects([p]);
        setActiveId(p.id);
      } else {
        setProjects(next);
        if (activeId === id) setActiveId(next[0].id);
      }
    } catch { toast.error("Failed to delete project"); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const handleSend = async (text: string) => {
    if (!active) return;

    // Image mode: use dedicated image generation
    if (appMode === "image") {
      return handleImageSend(text);
    }

    const userMsg = { role: "user" as const, content: text };
    const newMessages = [...active.messages, userMsg];
    const newName = active.messages.length === 0 ? text.slice(0, 40) : active.name;
    updateProject(active.id, { messages: newMessages, name: newName });
    setLoading(true);
    setStreamingContent("");

    try {
      await saveMessageToCloud(active.id, "user", text);
      if (newName !== active.name) await saveProjectToCloud({ ...active, name: newName });
    } catch (err) { console.error("Failed to save:", err); }

    let fullContent = "";
    try {
      await streamChat({
        messages: newMessages,
        onDelta: (chunk) => { fullContent += chunk; setStreamingContent(fullContent); },
        onDone: async () => {
          const html = extractHtml(fullContent);
          const finalMessages = [...newMessages, { role: "assistant" as const, content: fullContent }];
          updateProject(active.id, { messages: finalMessages, html });
          setStreamingContent("");
          setLoading(false);
          try {
            await saveMessageToCloud(active.id, "assistant", fullContent);
            await saveProjectToCloud({ ...active, html, name: newName });
          } catch {}
          if (appMode === "builder" && html && html.trim().match(/^(<(!DOCTYPE|html))/i)) setView("preview");
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      updateProject(active.id, { messages: active.messages });
      setStreamingContent("");
      setLoading(false);
    }
  };

  const handleImageSend = async (text: string) => {
    if (!active) return;
    const userMsg = { role: "user" as const, content: text };
    const newMessages = [...active.messages, userMsg];
    const newName = active.messages.length === 0 ? text.slice(0, 40) : active.name;
    updateProject(active.id, { messages: newMessages, name: newName });
    setLoading(true);

    try {
      await saveMessageToCloud(active.id, "user", text);
      if (newName !== active.name) await saveProjectToCloud({ ...active, name: newName });
    } catch (err) { console.error("Failed to save:", err); }

    try {
      const result = await generateImage(text);
      // Build assistant content with images as markdown
      let assistantContent = result.text || "";
      if (result.images && result.images.length > 0) {
        result.images.forEach((imgUrl) => {
          assistantContent += `\n\n![Generated Image](${imgUrl})`;
        });
      }
      const finalMessages = [...newMessages, { role: "assistant" as const, content: assistantContent }];
      updateProject(active.id, { messages: finalMessages });
      try {
        // Save text description only (base64 is too large for DB)
        const dbContent = result.text || "🖼️ Image generated";
        await saveMessageToCloud(active.id, "assistant", dbContent);
        await saveProjectToCloud({ ...active, name: newName });
      } catch {}
    } catch (err: any) {
      toast.error(err.message || "Image generation failed");
      updateProject(active.id, { messages: active.messages });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (index: number) => {
    if (!active) return;
    const newMessages = active.messages.filter((_, i) => i !== index);
    updateProject(active.id, { messages: newMessages });
    try { await replaceMessagesInCloud(active.id, newMessages); } catch {}
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    if (!active) return;
    const newMessages = active.messages.slice(0, index);
    newMessages.push({ role: "user", content: newContent });
    updateProject(active.id, { messages: newMessages });
    try { await replaceMessagesInCloud(active.id, newMessages); } catch {}
    handleSendWithMessages(newMessages);
  };

  const handleRegenerate = async (index: number) => {
    if (!active) return;
    const newMessages = active.messages.slice(0, index);
    updateProject(active.id, { messages: newMessages });
    try { await replaceMessagesInCloud(active.id, newMessages); } catch {}
    handleSendWithMessages(newMessages);
  };

  const handleSendWithMessages = async (msgs: { role: "user" | "assistant"; content: string }[]) => {
    if (!active) return;
    setLoading(true);
    setStreamingContent("");
    let fullContent = "";
    try {
      await streamChat({
        messages: msgs,
        onDelta: (chunk) => { fullContent += chunk; setStreamingContent(fullContent); },
        onDone: async () => {
          const html = extractHtml(fullContent);
          const finalMessages = [...msgs, { role: "assistant" as const, content: fullContent }];
          updateProject(active.id, { messages: finalMessages, html });
          setStreamingContent("");
          setLoading(false);
          try {
            await saveMessageToCloud(active.id, "assistant", fullContent);
            await saveProjectToCloud({ ...active, html });
          } catch {}
          if (appMode === "builder" && html && html.trim().match(/^(<(!DOCTYPE|html))/i)) setView("preview");
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setStreamingContent("");
      setLoading(false);
    }
  };

  const handleToolSend = async (text: string) => {
    if (!activeTool) return;
    const userMsg = { role: "user" as const, content: text };
    const newMsgs = [...toolMessages, userMsg];
    setToolMessages(newMsgs);
    handleToolSendWithMessages(newMsgs);
  };

  const handleToolSendWithMessages = async (msgs: { role: "user" | "assistant"; content: string }[]) => {
    if (!activeTool) return;
    setLoading(true);
    setToolStreamingContent("");
    let fullContent = "";
    try {
      await streamChat({
        messages: msgs,
        tool: activeTool.id,
        onDelta: (chunk) => { fullContent += chunk; setToolStreamingContent(fullContent); },
        onDone: () => {
          setToolMessages([...msgs, { role: "assistant", content: fullContent }]);
          setToolStreamingContent("");
          setLoading(false);
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setToolStreamingContent("");
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

  // If no mode selected, show HomeScreen
  if (!appMode) {
    return (
      <div className="flex h-[100dvh] overflow-hidden">
        <HomeScreen onSelectMode={(mode) => { setAppMode(mode); setView("chat"); }} />
      </div>
    );
  }

  const placeholders: Record<AppMode, string> = {
    chat: "Type your message...",
    builder: "Describe your website...",
    image: "Describe the image you want to create...",
    video: "Describe the video you want to create...",
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar for ALL modes */}
      <div className={`fixed lg:static z-50 h-full transition-transform lg:translate-x-0 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          projects={projects}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setShowSidebar(false); setView("chat"); }}
          onNew={handleNew}
          onDelete={handleDelete}
          onLogout={handleLogout}
          mode={appMode}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          view={view}
          onViewChange={setView}
          onDownload={handleDownload}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onBack={() => { setAppMode(null); setProjects([]); setActiveId(""); }}
          appMode={appMode}
        />

        {appMode === "builder" ? (
          <>
            {view === "chat" ? (
              <ChatPane messages={allMessages} loading={loading && !streamingContent} onSuggestionClick={handleSend} onEdit={handleEditMessage} onDelete={handleDeleteMessage} onRegenerate={handleRegenerate} />
            ) : (
              <PreviewPane html={active?.html || ""} view={view as "preview" | "code"} />
            )}
            {view === "chat" && <ChatInput onSend={handleSend} loading={loading} placeholder={placeholders.builder} />}
          </>
        ) : (
          <>
            <ChatPane messages={allMessages} loading={loading && !streamingContent} onSuggestionClick={handleSend} onEdit={handleEditMessage} onDelete={handleDeleteMessage} onRegenerate={handleRegenerate} />
            <ChatInput onSend={handleSend} loading={loading} placeholder={placeholders[appMode]} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
