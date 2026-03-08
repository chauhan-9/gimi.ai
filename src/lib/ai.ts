import type { Settings } from "./storage";

const SYSTEM_PROMPT =
  "You are a web developer. Output ONLY raw HTML code for a complete, single-file webpage. Do not include markdown code fences, explanations, or any text outside the HTML. Use inline CSS and JavaScript. The HTML must start with <!DOCTYPE html> or <html>.";

export async function sendMessage(
  settings: Settings,
  messages: { role: string; content: string }[]
): Promise<string> {
  const body = {
    model: settings.modelId,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
  };

  const response = await fetch(settings.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error("API Error: " + text);
  }

  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content || "";

  // Extract HTML from response - strip markdown fences if present
  const htmlMatch = content.match(/```html\s*([\s\S]*?)```/);
  return htmlMatch ? htmlMatch[1].trim() : content;
}
