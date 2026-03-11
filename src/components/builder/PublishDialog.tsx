import { useState, useEffect } from "react";
import { Globe, Copy, Check, ExternalLink, Loader2, X, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  html: string;
}

export function PublishDialog({ open, onClose, projectId, projectName, html }: PublishDialogProps) {
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (open && projectId) {
      // Check if already published
      checkExisting();
      // Generate default slug
      const defaultSlug = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30) || "my-site";
      setSlug(defaultSlug);
    }
  }, [open, projectId, projectName]);

  const checkExisting = async () => {
    const { data } = await supabase
      .from("published_sites")
      .select("slug")
      .eq("project_id", projectId)
      .maybeSingle();
    if (data?.slug) {
      setExistingSlug(data.slug);
      setSlug(data.slug);
      const url = getPublishedUrl(data.slug);
      setPublishedUrl(url);
    }
  };

  const getPublishedUrl = (s: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/published-sites/${s}/index.html`;
  };

  const handlePublish = async () => {
    if (!html.trim()) {
      toast.error("Pehle kuch build karo!");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug dalo!");
      return;
    }

    setPublishing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const filePath = `${slug}/index.html`;
      const htmlBlob = new Blob([html], { type: "text/html" });

      // Upload HTML to storage
      const { error: uploadError } = await supabase.storage
        .from("published-sites")
        .upload(filePath, htmlBlob, {
          upsert: true,
          contentType: "text/html",
        });

      if (uploadError) throw uploadError;

      // Save/update published_sites record
      if (existingSlug) {
        // If slug changed, remove old file
        if (existingSlug !== slug) {
          await supabase.storage
            .from("published-sites")
            .remove([`${existingSlug}/index.html`]);
        }
        await supabase
          .from("published_sites")
          .update({ slug, updated_at: new Date().toISOString() })
          .eq("project_id", projectId);
      } else {
        await supabase
          .from("published_sites")
          .insert({
            project_id: projectId,
            user_id: session.user.id,
            slug,
          });
      }

      setExistingSlug(slug);
      const url = getPublishedUrl(slug);
      setPublishedUrl(url);
      toast.success("🎉 Site published successfully!");
    } catch (err: any) {
      console.error("Publish error:", err);
      if (err.message?.includes("Duplicate")) {
        toast.error("Yeh slug pehle se use ho raha hai, dusra try karo!");
      } else {
        toast.error(err.message || "Publish failed");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      toast.success("URL copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGitHubExport = () => {
    if (!html.trim()) {
      toast.error("Pehle kuch build karo!");
      return;
    }

    // Create a downloadable package for GitHub
    const readmeContent = `# ${projectName}\n\nBuilt with Gimi.AI Builder\n\n## Setup\n\nOpen \`index.html\` in your browser.\n`;
    
    // Download as zip-like structure (individual files)
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);

    // Also download README
    const readmeBlob = new Blob([readmeContent], { type: "text/markdown" });
    const readmeUrl = URL.createObjectURL(readmeBlob);
    const b = document.createElement("a");
    b.href = readmeUrl;
    b.download = "README.md";
    b.click();
    URL.revokeObjectURL(readmeUrl);

    toast.success("Files downloaded! Upload these to your GitHub repository.");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground font-display">Publish Site</h3>
              <p className="text-xs text-muted-foreground">Apni site ko live karo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Slug input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Site URL Slug</label>
            <div className="flex items-center gap-2">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-awesome-site"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Published URL */}
          {publishedUrl && (
            <div className="bg-muted/50 rounded-xl p-3.5 border border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🎉 Live URL</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-primary font-medium truncate flex-1">{publishedUrl}</p>
                <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handlePublish}
              disabled={publishing || !html.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {publishing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe size={16} />
                  {existingSlug ? "Update & Publish" : "Publish Now"}
                </>
              )}
            </button>

            <button
              onClick={handleGitHubExport}
              disabled={!html.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <Github size={16} />
              Export for GitHub
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Published sites are publicly accessible. GitHub export downloads files you can push to any repository.
          </p>
        </div>
      </div>
    </div>
  );
}