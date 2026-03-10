import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Camera, User, Mail, Palette, Trash2, LogOut, Shield, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import hexaIcon from "@/assets/hexa-icon.png";

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onClearAllChats?: () => void;
}

type ThemeOption = "light" | "dark" | "system";

export function ProfilePage({ onBack, onLogout, onClearAllChats }: ProfilePageProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("light");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [joinedDate, setJoinedDate] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setEmail(session.user.email || "");
      
      const created = session.user.created_at;
      if (created) {
        setJoinedDate(new Date(created).toLocaleDateString("en-US", { month: "long", year: "numeric" }));
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || session.user.email?.split("@")[0] || "");
        setAvatarUrl(profile.avatar_url);
      }
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem("gimi-theme") as ThemeOption | null;
    if (savedTheme) setTheme(savedTheme);

    loadProfile();
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: nameInput.trim() })
        .eq("id", session.user.id);

      if (error) throw error;
      setDisplayName(nameInput.trim());
      setEditingName(false);
      toast.success("Name updated successfully!");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    localStorage.setItem("hexa-theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleClearAllChats = async () => {
    setShowClearConfirm(false);
    onClearAllChats?.();
    toast.success("All chats cleared!");
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    toast.error("Account deletion requires admin approval. Please contact support.");
  };

  const getInitials = () => {
    if (!displayName) return "?";
    return displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-display text-foreground">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-border flex items-center justify-center text-primary text-2xl font-bold font-display">
                  {getInitials()}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera size={20} className="text-background" />
              </div>
            </div>

            {/* Name & Email */}
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    className="text-lg font-semibold bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-primary text-foreground flex-1"
                    placeholder="Your name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 font-medium"
                  >
                    {saving ? "..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground hover:bg-secondary font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingName(true); setNameInput(displayName); }}
                  className="group/name text-left"
                >
                  <h2 className="text-lg font-semibold text-foreground group-hover/name:text-primary transition-colors">
                    {displayName}
                  </h2>
                </button>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={13} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground truncate">{email}</p>
              </div>
              {joinedDate && (
                <p className="text-xs text-muted-foreground/60 mt-1">Joined {joinedDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-xs text-muted-foreground mb-3">Choose your preferred theme</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "light" as ThemeOption, icon: Sun, label: "Light" },
                { key: "dark" as ThemeOption, icon: Moon, label: "Dark" },
                { key: "system" as ThemeOption, icon: Monitor, label: "System" },
              ]).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    theme === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Data & Privacy</h3>
            </div>
          </div>
          <div className="divide-y divide-border">
            {/* Clear all chats */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-muted transition-colors"
            >
              <Trash2 size={16} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Clear all chats</p>
                <p className="text-xs text-muted-foreground">Delete all your conversations permanently</p>
              </div>
            </button>

            {/* Sign out */}
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-muted transition-colors"
            >
              <LogOut size={16} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Sign out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
              </div>
            </button>

            {/* Delete account */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-destructive/5 transition-colors"
            >
              <Trash2 size={16} className="text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Delete account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="flex items-center justify-center gap-2 py-4">
          <img src={hexaIcon} alt="Hexa.AI" className="w-5 h-5 rounded-md" />
          <span className="text-xs text-muted-foreground">Hexa.AI v1.0 • Powered by AI</span>
        </div>

        {/* Clear Chats Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-foreground mb-2">Clear all chats?</h3>
              <p className="text-sm text-muted-foreground mb-5">This will permanently delete all your conversations. This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm rounded-xl bg-muted text-muted-foreground hover:bg-secondary transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleClearAllChats} className="px-4 py-2 text-sm rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity font-medium">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-destructive mb-2">Delete Account?</h3>
              <p className="text-sm text-muted-foreground mb-5">This will permanently delete your account, all chats, and all projects. This cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm rounded-xl bg-muted text-muted-foreground hover:bg-secondary transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} className="px-4 py-2 text-sm rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
