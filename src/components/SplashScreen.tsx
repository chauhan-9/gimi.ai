import React, { useEffect, useState } from "react";
import splashLogo from "@/assets/hexa-splash-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2800 }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "fadeout">("logo");
  const [textIndex, setTextIndex] = useState(0);
  const brandName = "Gimi.AI";

  useEffect(() => {
    // Phase 1: Logo animation (0-800ms)
    const textTimer = setTimeout(() => setPhase("text"), 800);
    
    // Phase 2: Text animation starts
    // Phase 3: Fade out
    const fadeTimer = setTimeout(() => setPhase("fadeout"), duration - 500);
    
    // Complete
    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  // Text reveal animation
  useEffect(() => {
    if (phase === "text" && textIndex < brandName.length) {
      const timer = setTimeout(() => {
        setTextIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [phase, textIndex]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Glowing background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Logo with animations */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          phase === "logo" 
            ? "scale-0 opacity-0 rotate-180" 
            : "scale-100 opacity-100 rotate-0"
        }`}
        style={{
          transitionDelay: phase === "logo" ? "0ms" : "100ms",
        }}
      >
        {/* Rotating glow ring */}
        <div className="absolute inset-0 -m-4 rounded-full border-2 border-primary/20 animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-0 -m-8 rounded-full border border-primary/10 animate-[spin_12s_linear_infinite_reverse]" />
        
        {/* Pulsing glow behind logo */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse scale-110" />
        
        {/* Main logo */}
        <img
          src={splashLogo}
          alt="Gimi.AI"
          className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-2xl animate-[float_3s_ease-in-out_infinite]"
        />
      </div>

      {/* Brand name with character reveal */}
      <div className="mt-8 h-12 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          {brandName.split("").map((char, i) => (
            <span
              key={i}
              className={`inline-block transition-all duration-300 ${
                i < textIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                color: i < 4 ? "hsl(var(--foreground))" : "hsl(var(--primary))",
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {char}
            </span>
          ))}
          {/* Blinking cursor */}
          {phase === "text" && textIndex <= brandName.length && (
            <span className="inline-block w-0.5 h-8 bg-primary ml-1 animate-pulse" />
          )}
        </h1>
      </div>

      {/* Tagline */}
      <p
        className={`mt-3 text-muted-foreground text-sm md:text-base transition-all duration-500 ${
          textIndex >= brandName.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        Your Intelligent AI Assistant
      </p>

      {/* Loading dots */}
      <div className="mt-8 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
