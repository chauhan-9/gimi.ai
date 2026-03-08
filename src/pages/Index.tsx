import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/builder/Sidebar";
import { SettingsModal } from "@/components/builder/SettingsModal";
import { Header } from "@/components/builder/Header";
import { ChatInput } from "@/components/builder/ChatInput";
import { ChatPane } from "@/components/builder/ChatPane";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { sendMessage } from "@/lib/ai";
import {
  loadSettings, saveSettings,
  loadProjects, saveProjects,
  loadActiveId, saveActiveId,
  createProject,
  type Project, type Settings,
} from "@/lib/storage";

const Index = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [projects, setProjects] = useState<Project[]>(() => {
    const p = loadProjects();
    return p.length ? p : [createProject("My First Project")];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    return loadActiveId() || projects[0]?.id || "";
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [loading, setLoading] = useState(false);

  const active = projects.find((p) => p.id === activeId) || projects[0];

  // Persist
  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { saveActiveId(activeId); }, [activeId]);
  useEffect(() => { saveSettings(settings); }, [settings]);

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
    if (!active || !settings.apiKey) {
      setShowSettings(true);
      return;
    }

    const newMessages = [...active.messages, { role: "user" as const, content: text }];
    updateProject(active.id, { messages: newMessages });
    setLoading(true);

    try {
      const reply = await sendMessage(settings, newMessages);
      const finalMessages = [...newMessages, { role: "assistant" as const, content: reply }];
      updateProject(active.id, {
        messages: finalMessages,
        html: reply,
        name: active.messages.length === 0 ? text.slice(0, 40) : active.name,
      });
    } catch (err: any) {
      alert(err.message || "Something went wrong");
      // Revert the user message on error
      updateProject(active.id, { messages: active.messages });
    } finally {
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
          onOpenSettings={() => setShowSettings(true)}
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
        <PreviewPane html={active?.html || ""} view={view} />
        <ChatInput onSend={handleSend} loading={loading} />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default Index;
