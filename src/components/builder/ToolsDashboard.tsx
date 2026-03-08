import {
  PenLine, Languages, Code2, GraduationCap, Mail, BookOpen,
  SpellCheck, FileUser, ArrowLeft
} from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";

export interface AiTool {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
}

export const AI_TOOLS: AiTool[] = [
  { id: "writer", label: "AI Writer", description: "Blog, article, story, ad copy", icon: <PenLine size={20} />, placeholder: "What should I write?" },
  { id: "translator", label: "Translator", description: "Translate to any language", icon: <Languages size={20} />, placeholder: "Paste text and target language..." },
  { id: "code-generator", label: "Code Generator", description: "Generate code in any language", icon: <Code2 size={20} />, placeholder: "Describe the code you need..." },
  { id: "homework-solver", label: "Homework Solver", description: "Math, Science, any subject", icon: <GraduationCap size={20} />, placeholder: "Type your question..." },
  { id: "email-writer", label: "Email Writer", description: "Professional emails instantly", icon: <Mail size={20} />, placeholder: "Who and what topic..." },
  { id: "blog-generator", label: "Blog Generator", description: "SEO-friendly blog posts", icon: <BookOpen size={20} />, placeholder: "Blog topic and audience..." },
  { id: "grammar-fixer", label: "Grammar Fixer", description: "Fix grammar and spelling", icon: <SpellCheck size={20} />, placeholder: "Paste text to fix..." },
  { id: "resume-builder", label: "Resume Builder", description: "Professional resume/CV", icon: <FileUser size={20} />, placeholder: "Your experience and skills..." },
];

interface ToolsDashboardProps {
  onSelectTool: (tool: AiTool) => void;
}

export function ToolsDashboard({ onSelectTool }: ToolsDashboardProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden">
              <img src={hexaIcon} alt="Hexa.AI" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">AI Tools</h2>
          <p className="text-sm text-muted-foreground">Powerful tools to boost your productivity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AI_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{tool.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ToolChatHeaderProps {
  tool: AiTool;
  onBack: () => void;
}

export function ToolChatHeader({ tool, onBack }: ToolChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-card border-b border-border flex-shrink-0">
      <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} />
      </button>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <span className="[&>svg]:w-4 [&>svg]:h-4">{tool.icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{tool.label}</p>
        <p className="text-[10px] text-muted-foreground">{tool.description}</p>
      </div>
    </div>
  );
}
