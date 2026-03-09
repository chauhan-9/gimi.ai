import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/builder/Sidebar";
import { Header, type View } from "@/components/builder/Header";
import { ChatInput } from "@/components/builder/ChatInput";
import { ChatPane } from "@/components/builder/ChatPane";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { HomeScreen } from "@/components/builder/HomeScreen";
import { ProfilePage } from "@/components/builder/ProfilePage";
import type { AppMode } from "@/lib/storage";
import { streamChat, extractHtml, generateImage } from "@/lib/ai-stream";
import { getStoredModel } from "@/components/builder/ModelSelector";
import { parseHtmlToFiles, downloadProjectFiles } from "@/lib/code-parser";
import {
  loadProjectsFromCloud,
  saveProjectToCloud,
  saveMessageToCloud,
  deleteProjectFromCloud,
  createProjectInCloud,
  replaceMessagesInCloud,
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
  const [continueLastSession, setContinueLastSession] = useState(false);
  const [view, setView] = useState<View>("chat");
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => getStoredModel("chat"));
  const [userName, setUserName] = useState<string>("");
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
      // Fetch user display name
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", session.user.id).single();
      if (profile?.display_name) setUserName(profile.display_name);
      else setUserName(session.user.email?.split("@")[0] || "");
    }
    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Update selected model when mode changes
  useEffect(() => {
    if (appMode) setSelectedModel(getStoredModel(appMode));
  }, [appMode]);

  // Load projects when mode changes
  // Logic:
  // - Normal entry (onSelectMode): always create a fresh new chat, old chats go in history
  // - Continue last session (onContinueLastChat): don't create new, open last active project
  useEffect(() => {
    if (!isInitialized || !appMode) return;

    setProjects([]);
    setActiveId("");
    setStreamingContent("");
    setShowProfile(false);

    // Save last mode so Home can show "Continue"
    localStorage.setItem("hexa-last-mode", appMode);

    async function loadForMode() {
      const defaultName = appMode === "chat" ? "New Chat" : "New Project";

      try {
        // 1) Load previous history
        const history = await loadProjectsFromCloud(appMode);

        if (continueLastSession && history.length > 0) {
          // Continue mode: open the most recent project (top of list)
          setProjects(history);
          setActiveId(history[0].id);
          setView("chat");
        } else {
          // Fresh mode: create a new empty project + history behind it
          const fresh = await createProjectInCloud(defaultName, appMode);
          setProjects([fresh, ...history]);
          setActiveId(fresh.id);
          setView("chat");
        }
      } catch (err) {
        console.error("Failed to load:", err);
        const fresh = createProject(defaultName, appMode);
        setProjects([fresh]);
        setActiveId(fresh.id);
        setView("chat");
      }

      // Reset the flag
      setContinueLastSession(false);
    }

    loadForMode();
  }, [appMode, isInitialized, continueLastSession]);

  useEffect(() => { if (activeId && appMode) saveActiveId(activeId, appMode); }, [activeId, appMode]);

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

  // Detect if user wants image generation in chat mode
  const isImageRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    const keywords = ["image", "photo", "picture", "illustration", "logo", "draw", "generate image", "create image", "tasveer", "image bana", "photo bana", "image generate", "pic bana"];
    return keywords.some(k => lower.includes(k));
  };

  const handleSend = async (text: string) => {
    if (!active) return;

    // In chat mode, detect image requests and route to image generation
    if (appMode === "chat" && isImageRequest(text)) {
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
      const toolParam = appMode === "chat" ? "chat" : undefined;
      await streamChat({
        messages: newMessages,
        tool: toolParam,
        model: selectedModel,
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
      const result = await generateImage(text, "google/gemini-2.5-flash-image");
      let assistantContent = result.text || "";
      if (result.images && result.images.length > 0) {
        result.images.forEach((imgUrl) => {
          assistantContent += `\n\n![Generated Image](${imgUrl})`;
        });
      }
      const finalMessages = [...newMessages, { role: "assistant" as const, content: assistantContent }];
      updateProject(active.id, { messages: finalMessages });
      try {
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
      const toolParam = appMode === "chat" ? "chat" : undefined;
      await streamChat({
        messages: msgs,
        tool: toolParam,
        model: selectedModel,
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

  const handleDownload = () => {
    if (!active?.html) return;
    const files = parseHtmlToFiles(active.html);
    if (files.length > 0) {
      downloadProjectFiles(files, active.name || "hexa-project");
      toast.success("Project files downloading!");
    } else {
      const blob = new Blob([active.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "index.html";
      a.click();
      URL.revokeObjectURL(url);
    }
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

  if (!appMode) {
    return (
      <div className="flex h-[100dvh] overflow-hidden">
        <HomeScreen onSelectMode={(mode) => { setAppMode(mode); setView("chat"); }} />
      </div>
    );
  }

  const placeholders: Record<AppMode, string> = {
    chat: "Kuch bhi pucho, image banao, video plan karo...",
    builder: "Describe your website or app...",
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      <div className={`fixed lg:static z-50 h-full transition-transform lg:translate-x-0 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          projects={projects}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setShowSidebar(false); setView("chat"); setShowProfile(false); }}
          onNew={() => { handleNew(); setShowProfile(false); }}
          onDelete={handleDelete}
          onRename={async (id, newName) => {
            updateProject(id, { name: newName });
            const proj = projects.find(p => p.id === id);
            if (proj) { try { await saveProjectToCloud({ ...proj, name: newName }); } catch {} }
          }}
          onLogout={handleLogout}
          onProfile={() => { setShowProfile(true); setShowSidebar(false); }}
          mode={appMode}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {showProfile ? (
          <ProfilePage
            onBack={() => setShowProfile(false)}
            onLogout={handleLogout}
            onClearAllChats={async () => {
              try {
                for (const p of projects) {
                  await replaceMessagesInCloud(p.id, []);
                }
                setProjects(prev => prev.map(p => ({ ...p, messages: [] })));
                setShowProfile(false);
              } catch { toast.error("Failed to clear chats"); }
            }}
          />
        ) : (
          <>
            <Header
              view={view}
              onViewChange={setView}
              onDownload={handleDownload}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onBack={() => { setAppMode(null); setProjects([]); setActiveId(""); setStreamingContent(""); setLoading(false); }}
              appMode={appMode}
            />

            {appMode === "builder" ? (
              <>
                {view === "chat" ? (
                  <ChatPane
                    messages={allMessages}
                    loading={loading && !streamingContent}
                    typingAnimationForLastAssistant={Boolean(streamingContent)}
                    appMode={appMode}
                    userName={userName}
                    onSuggestionClick={handleSend}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onRegenerate={handleRegenerate}
                  />
                ) : (
                  <PreviewPane html={active?.html || ""} view={view as "preview" | "code"} />
                )}
                {view === "chat" && (
                  <ChatInput
                    onSend={handleSend}
                    loading={loading}
                    placeholder={placeholders.builder}
                    appMode={appMode}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                )}
              </>
            ) : (
              <>
                <ChatPane
                  messages={allMessages}
                  loading={loading && !streamingContent}
                  typingAnimationForLastAssistant={Boolean(streamingContent)}
                  appMode={appMode}
                  userName={userName}
                  onSuggestionClick={handleSend}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onRegenerate={handleRegenerate}
                />
                <ChatInput
                  onSend={handleSend}
                  loading={loading}
                  placeholder={placeholders[appMode]}
                  appMode={appMode}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
