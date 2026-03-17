import { MessageCircle, Code, ArrowRight, Sparkles } from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";
import type { AppMode } from "@/lib/storage";

interface HomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
}

const modes = [
  {
    id: "chat" as AppMode,
    icon: <MessageCircle size={24} />,
    title: "Chat with AI",
    description: "Have conversations, generate images, get instant answers",
    gradient: "from-primary to-accent",
    features: ["Image generation", "Code help", "Creative writing"],
  },
  {
    id: "builder" as AppMode,
    icon: <Code size={24} />,
    title: "Build Website",
    description: "Generate full websites from text prompts with AI",
    gradient: "from-accent to-primary",
    features: ["Live preview", "Code editor", "One-click publish"],
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function HomeScreen({ onSelectMode }: HomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 py-8 overflow-y-auto">
      <div className="max-w-md w-full space-y-10 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg animate-float ring-1 ring-border/30">
              <img src={hexaIcon} alt="Gimi.AI" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shadow-md">
              <Sparkles size={14} className="text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{getGreeting()}! 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground leading-tight">
            Welcome to <span className="gradient-text">Gimi.AI</span>
          </h1>
          <p className="text-sm text-muted-foreground/70">What would you like to do today?</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="group relative flex items-center gap-4 px-5 py-5 rounded-2xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/25 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] text-left glass-card"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-105 transition-transform duration-300`}>
                {mode.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground font-display">{mode.title}</p>
                  <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {mode.features.map((f, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40">
          Powered by Gimi.AI ✨
        </p>
      </div>
    </div>
  );
}
