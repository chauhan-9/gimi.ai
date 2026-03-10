import { MessageCircle, Code } from "lucide-react";
import hexaIcon from "@/assets/hexa-icon.png";
import type { AppMode } from "@/lib/storage";

interface HomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
}

const modes = [
  {
    id: "chat" as AppMode,
    icon: <MessageCircle size={28} />,
    title: "Chat with AI",
    description: "Baat karo, image banao, video plan karo — sab ek jagah",
    gradient: "from-primary to-accent",
  },
  {
    id: "builder" as AppMode,
    icon: <Code size={28} />,
    title: "Build App / Website",
    description: "Website ya app banao, preview dekho, code copy karo",
    gradient: "from-accent to-primary",
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
      <div className="max-w-lg w-full space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg animate-float">
            <img src={hexaIcon} alt="Gimi.AI" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">{getGreeting()}! 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
            Welcome to <span className="gradient-text">Hexa.AI</span>
          </h1>
          <p className="text-xs text-muted-foreground">Aap kya karna chahte hain?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="group relative flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.97]"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {mode.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground font-display">{mode.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60">
          Powered by Hexa.AI ✨
        </p>
      </div>
    </div>
  );
}
