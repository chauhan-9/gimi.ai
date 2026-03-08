/**
 * Parse a single HTML string into virtual files: index.html, style.css, script.js
 */

export interface VirtualFile {
  name: string;
  language: string;
  content: string;
  icon: string;
}

export function parseHtmlToFiles(html: string): VirtualFile[] {
  if (!html || !html.trim()) return [];

  const files: VirtualFile[] = [];

  // Extract <style> blocks
  let cssContent = "";
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    cssContent += styleMatch[1].trim() + "\n\n";
  }

  // Extract <script> blocks (not src-based)
  let jsContent = "";
  const scriptRegex = /<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const content = scriptMatch[1].trim();
    if (content) jsContent += content + "\n\n";
  }

  // Create clean HTML (without inline styles/scripts for display, but keep the full version)
  const cleanHtml = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '  <link rel="stylesheet" href="style.css">')
    .replace(/<script(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi, '  <script src="script.js"></script>')
    // Remove duplicate link/script tags
    .replace(/(  <link rel="stylesheet" href="style\.css">\s*){2,}/g, '  <link rel="stylesheet" href="style.css">\n')
    .replace(/(  <script src="script\.js"><\/script>\s*){2,}/g, '  <script src="script.js"></script>\n');

  files.push({
    name: "index.html",
    language: "html",
    content: cleanHtml.trim(),
    icon: "🌐",
  });

  if (cssContent.trim()) {
    files.push({
      name: "style.css",
      language: "css",
      content: cssContent.trim(),
      icon: "🎨",
    });
  }

  if (jsContent.trim()) {
    files.push({
      name: "script.js",
      language: "javascript",
      content: jsContent.trim(),
      icon: "⚡",
    });
  }

  return files;
}

/**
 * Generate a downloadable ZIP blob from virtual files
 * (Simple zip-like structure using just HTML download for now)
 */
export function downloadProjectFiles(files: VirtualFile[], projectName: string) {
  files.forEach((file) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Download full HTML as single file
 */
export function downloadFullHtml(html: string, name: string = "index.html") {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
