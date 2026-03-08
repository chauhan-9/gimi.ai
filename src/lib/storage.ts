export interface Project {
  id: string;
  name: string;
  html: string;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: number;
}

export interface Settings {
  apiUrl: string;
  apiKey: string;
  modelId: string;
}

const PROJECTS_KEY = "ai-builder-projects";
const SETTINGS_KEY = "ai-builder-settings";
const ACTIVE_KEY = "ai-builder-active";

export const defaultSettings: Settings = {
  apiUrl: "https://openrouter.ai/api/v1/chat/completions",
  apiKey: "",
  modelId: "deepseek/deepseek-r1:free",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function createProject(name?: string): Project {
  return {
    id: crypto.randomUUID(),
    name: name || `Project ${Date.now()}`,
    html: "",
    messages: [],
    createdAt: Date.now(),
  };
}
