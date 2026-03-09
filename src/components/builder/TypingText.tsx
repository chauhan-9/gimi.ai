import React, { useState, useEffect, useRef } from "react";

interface TypingTextProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  children: (displayedText: string, isComplete: boolean) => React.ReactNode;
}

export function TypingText({ text, speed = 8, onComplete, children }: TypingTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const prevTextRef = useRef(text);
  const targetLengthRef = useRef(0);

  useEffect(() => {
    // If text grew (streaming), animate from current position to new length
    if (text.length > prevTextRef.current.length && text.startsWith(prevTextRef.current)) {
      targetLengthRef.current = text.length;
    } else if (text !== prevTextRef.current) {
      // Text changed completely, reset
      setDisplayedLength(0);
      targetLengthRef.current = text.length;
      setIsComplete(false);
    }
    prevTextRef.current = text;
  }, [text]);

  useEffect(() => {
    targetLengthRef.current = text.length;
    
    if (displayedLength >= text.length) {
      if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    // Calculate dynamic speed based on remaining characters
    // Faster for longer texts, slower for short
    const remaining = text.length - displayedLength;
    const dynamicSpeed = remaining > 100 ? Math.max(2, speed / 2) : speed;
    
    // Process multiple characters per tick for longer texts
    const charsPerTick = remaining > 500 ? 3 : remaining > 200 ? 2 : 1;

    const timer = setTimeout(() => {
      setDisplayedLength(prev => Math.min(prev + charsPerTick, text.length));
    }, dynamicSpeed);

    return () => clearTimeout(timer);
  }, [displayedLength, text, speed, isComplete, onComplete]);

  const displayedText = text.slice(0, displayedLength);
  
  return <>{children(displayedText, isComplete)}</>;
}
