const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/website-builder-chat`;

type Msg = { role: "user" | "assistant"; content: string };

export async function streamChat({
  messages,
  tool,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  tool?: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, tool }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    try {
      const err = JSON.parse(text);
      throw new Error(err.error || "AI request failed");
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error("AI request failed: " + text);
      throw e;
    }
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export function extractHtml(content: string): string {
  // Try to extract HTML from markdown fences
  const htmlMatch = content.match(/```html\s*([\s\S]*?)```/);
  if (htmlMatch) return htmlMatch[1].trim();
  
  // If it starts with doctype or html tag, use as-is
  if (content.trim().match(/^(<(!DOCTYPE|html))/i)) return content.trim();
  
  return content;
}
