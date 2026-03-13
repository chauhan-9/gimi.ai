import { useState } from "react";
import { X, Bug, Zap, Search, Shield, Lightbulb, Code2, Loader2 } from "lucide-react";

interface AIToolsPanelProps {
  open: boolean;
  onClose: () => void;
  html: string;
  onSendPrompt: (prompt: string) => void;
  loading?: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  getPrompt: (html: string) => string;
}

const tools: Tool[] = [
  {
    id: "explain",
    name: "Explain Code",
    description: "AI se code ka detailed explanation lo",
    icon: <Lightbulb size={18} />,
    getPrompt: (html) => `Explain the following website code in detail. Break down the HTML structure, CSS styling, and JavaScript functionality. Explain what each section does and how they work together:\n\n\`\`\`html\n${html.slice(0, 3000)}\n\`\`\``,
  },
  {
    id: "bugfix",
    name: "Find & Fix Bugs",
    description: "Code mein bugs dhundo aur fix karo",
    icon: <Bug size={18} />,
    getPrompt: (html) => `Analyze this website code for bugs, errors, and issues. List each bug found with its location and provide the fixed version of the complete code. Check for:\n- HTML validation errors\n- CSS issues (broken layouts, missing styles)\n- JavaScript errors\n- Accessibility issues\n- Responsive design problems\n\n\`\`\`html\n${html.slice(0, 3000)}\n\`\`\`\n\nProvide the complete fixed HTML code.`,
  },
  {
    id: "optimize",
    name: "Optimize Code",
    description: "Performance aur code quality improve karo",
    icon: <Zap size={18} />,
    getPrompt: (html) => `Optimize this website code for better performance and code quality. Improve:\n- Remove redundant CSS\n- Optimize JavaScript\n- Improve load performance\n- Minify where possible\n- Use semantic HTML\n- Add lazy loading for images\n- Optimize animations\n\nProvide the complete optimized HTML code:\n\n\`\`\`html\n${html.slice(0, 3000)}\n\`\`\``,
  },
  {
    id: "seo",
    name: "SEO Analysis",
    description: "SEO score improve karo aur suggestions lo",
    icon: <Search size={18} />,
    getPrompt: (html) => `Perform a complete SEO analysis of this website code. Check and improve:\n- Meta tags (title, description, keywords)\n- Open Graph tags\n- Heading hierarchy (H1-H6)\n- Image alt texts\n- Semantic HTML structure\n- Schema markup\n- Mobile responsiveness\n- Page speed factors\n- URL structure suggestions\n\nProvide specific recommendations and the improved code:\n\n\`\`\`html\n${html.slice(0, 3000)}\n\`\`\``,
  },
  {
    id: "accessibility",
    name: "Accessibility Check",
    description: "WCAG compliance aur accessibility improve karo",
    icon: <Shield size={18} />,
    getPrompt: (html) => `Perform an accessibility audit (WCAG 2.1) on this website code. Check:\n- ARIA labels and roles\n- Color contrast ratios\n- Keyboard navigation\n- Screen reader compatibility\n- Focus indicators\n- Alt text for images\n- Form labels\n- Skip links\n\nList issues found and provide the fixed, accessible version:\n\n\`\`\`html\n${html.slice(0, 3000)}\n\`\`\``,
  },
  {
    id: "improve-ui",
    name: "Improve UI/UX",
    description: "Design aur user experience better banao",
    icon: <Code2 size={18} />,
    getPrompt: (html) => `Improve the UI/UX of this website. Make it more modern and visually appealing:\n- Better color scheme and typography\n- Improved spacing and layout\n- Add smooth animations and transitions\n- Better hover effects and micro-interactions\n- Improved mobile experience\n- Modern design patterns (glassmorphism, gradients)\n- Better visual hierarchy\n\nProvide the complete improved HTML code:\n\n\`\`\`html\n${html.slice(0, 3000)}\n\`\`\``,
  },
];

export function AIToolsPanel({ open, onClose, html, onSendPrompt, loading }: AIToolsPanelProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (!open) return null;

  const hasCode = html && html.trim().length > 0;

  const handleToolClick = (tool: Tool) => {
    if (!hasCode) return;
    setActiveTool(tool.id);
    onSendPrompt(tool.getPrompt(html));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            <h2 className="text-lg font-bold font-display text-foreground">AI Dev Tools</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {!hasCode && (
          <div className="p-6 text-center text-muted-foreground">
            <Code2 size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No code generated yet</p>
            <p className="text-xs mt-1">Pehle Builder mein ek website generate karo</p>
          </div>
        )}

        {hasCode && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-left disabled:opacity-50 group active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {loading && activeTool === tool.id ? <Loader2 size={18} className="animate-spin" /> : tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
