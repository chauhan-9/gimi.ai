import {
  PenLine, Languages, Code2, GraduationCap, Mail, BookOpen,
  SpellCheck, FileUser, ArrowLeft, Sparkles
} from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";

export interface AiTool {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  placeholder: string;
}

export const AI_TOOLS: AiTool[] = [
  {
    id: "writer",
    label: "AI Writer",
    description: "Blog, article, story, ad copy likho",
    icon: <PenLine size={22} />,
    gradient: "from-purple-500/15 to-pink-500/15",
    placeholder: "Kya likhna hai? Topic batao...",
  },
  {
    id: "translator",
    label: "Translator",
    description: "Kisi bhi language mein translate karo",
    icon: <Languages size={22} />,
    gradient: "from-blue-500/15 to-cyan-500/15",
    placeholder: "Text paste karo aur target language batao...",
  },
  {
    id: "code-generator",
    label: "Code Generator",
    description: "Any language mein code generate karo",
    icon: <Code2 size={22} />,
    gradient: "from-emerald-500/15 to-teal-500/15",
    placeholder: "Kaunsa code chahiye? Describe karo...",
  },
  {
    id: "homework-solver",
    label: "Homework Solver",
    description: "Math, Science, any subject ka solution",
    icon: <GraduationCap size={22} />,
    gradient: "from-amber-500/15 to-orange-500/15",
    placeholder: "Apna question yahan likho...",
  },
  {
    id: "email-writer",
    label: "Email Writer",
    description: "Professional emails likhwao instantly",
    icon: <Mail size={22} />,
    gradient: "from-rose-500/15 to-red-500/15",
    placeholder: "Kisko email bhejni hai aur topic kya hai...",
  },
  {
    id: "blog-generator",
    label: "Blog Generator",
    description: "SEO-friendly blog posts banao",
    icon: <BookOpen size={22} />,
    gradient: "from-indigo-500/15 to-violet-500/15",
    placeholder: "Blog topic aur audience batao...",
  },
  {
    id: "grammar-fixer",
    label: "Grammar Fixer",
    description: "Grammar, spelling, writing improve karo",
    icon: <SpellCheck size={22} />,
    gradient: "from-teal-500/15 to-green-500/15",
    placeholder: "Text paste karo jo fix karna hai...",
  },
  {
    id: "resume-builder",
    label: "Resume Builder",
    description: "Professional resume/CV banao",
    icon: <FileUser size={22} />,
    gradient: "from-sky-500/15 to-blue-500/15",
    placeholder: "Apni details batao - experience, skills...",
  },
];

interface ToolsDashboardProps {
  onSelectTool: (tool: AiTool) => void;
}

export function ToolsDashboard({ onSelectTool }: ToolsDashboardProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-builder-canvas">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden glow-primary">
              <img src={hexaIcon} alt="Hexa.AI" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display gradient-text">AI Tools</h2>
          <p className="text-sm text-muted-foreground">Powerful AI tools to boost your productivity</p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="flex items-start gap-3.5 p-4 rounded-xl glass-card hover:glow-primary hover:border-primary/30 transition-all text-left group"
            >
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="text-foreground/80">{tool.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-display">{tool.label}</p>
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
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
        <span className="text-foreground/80 [&>svg]:w-4 [&>svg]:h-4">{tool.icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold font-display text-foreground">{tool.label}</p>
        <p className="text-[10px] text-muted-foreground">{tool.description}</p>
      </div>
    </div>
  );
}
