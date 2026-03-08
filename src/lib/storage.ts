export interface Project {
  id: string;
  name: string;
  html: string;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: number;
}

const PROJECTS_KEY = "ai-builder-projects";
const ACTIVE_KEY = "ai-builder-active";

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
