import { supabase } from "@/integrations/supabase/client";

export type AppMode = "chat" | "builder" | "image" | "video";

export interface Project {
  id: string;
  name: string;
  html: string;
  mode: AppMode;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: number;
}

// ---- Cloud persistence (user-scoped) ----

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function loadProjectsFromCloud(mode?: AppMode): Promise<Project[]> {
  const userId = await getUserId();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId);
  if (mode) query = query.eq("mode", mode);
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) return [];

  const projects: Project[] = [];
  for (const p of data) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", p.id)
      .order("created_at", { ascending: true });

    projects.push({
      id: p.id,
      name: p.name,
      html: p.html || "",
      messages: (msgs || []).map((m: any) => ({ role: m.role, content: m.content })),
      createdAt: new Date(p.created_at).getTime(),
    });
  }
  return projects;
}

export async function saveProjectToCloud(project: Project): Promise<string> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("projects")
    .upsert({
      id: project.id,
      name: project.name,
      html: project.html,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveMessageToCloud(
  projectId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from("messages").insert({
    project_id: projectId,
    role,
    content,
    user_id: userId,
  });
  if (error) throw error;
}

export async function deleteMessagesFromCloud(projectId: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("project_id", projectId);
  if (error) throw error;
}

export async function replaceMessagesInCloud(
  projectId: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<void> {
  const userId = await getUserId();
  await deleteMessagesFromCloud(projectId);
  if (messages.length > 0) {
    const { error } = await supabase.from("messages").insert(
      messages.map((m) => ({ project_id: projectId, role: m.role, content: m.content, user_id: userId }))
    );
    if (error) throw error;
  }
}

export async function deleteProjectFromCloud(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function createProjectInCloud(name?: string): Promise<Project> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name: name || `Project ${Date.now()}`, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    html: data.html || "",
    messages: [],
    createdAt: new Date(data.created_at).getTime(),
  };
}

// ---- Local fallback ----

const ACTIVE_KEY = "ai-builder-active";

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
