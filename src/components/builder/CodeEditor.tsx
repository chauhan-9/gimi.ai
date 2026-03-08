import { useState, useMemo } from "react";
import { FileCode, FileText, Paintbrush, Zap, Copy, Check, Download, FolderOpen, Files } from "lucide-react";
import { parseHtmlToFiles, downloadProjectFiles, type VirtualFile } from "@/lib/code-parser";
import { toast } from "sonner";

// Syntax highlighting with VS Code-like colors (dark theme)
function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => (
    <div key={i} className="flex hover:bg-white/[0.03] -mx-4 px-4">
      <span className="select-none w-12 pr-4 text-right text-slate-600 text-xs shrink-0">{i + 1}</span>
      <span className="flex-1">
        {language === "html" ? highlightHtml(line) :
         language === "css" ? highlightCss(line) :
         highlightJs(line)}
      </span>
    </div>
  ));
}

function highlightHtml(line: string): React.ReactNode {
  return line.split(/(<[^>]*>)/g).map((part, i) => {
    if (part.startsWith("<")) {
      const tagParts = part.match(/^(<\/?)(\w[\w-]*)(.*?)(\/?>)$/);
      if (tagParts) {
        return (
          <span key={i}>
            <span className="text-slate-500">{tagParts[1]}</span>
            <span className="text-red-400">{tagParts[2]}</span>
            <span>{highlightAttributes(tagParts[3])}</span>
            <span className="text-slate-500">{tagParts[4]}</span>
          </span>
        );
      }
      return <span key={i} className="text-slate-500">{part}</span>;
    }
    return <span key={i} className="text-slate-300">{part}</span>;
  });
}

function highlightAttributes(attrStr: string): React.ReactNode {
  return attrStr.split(/(".*?")/g).map((part, i) => {
    if (part.startsWith('"')) {
      return <span key={i} className="text-emerald-400">{part}</span>;
    }
    // Attribute names
    return <span key={i} className="text-amber-300">{part}</span>;
  });
}

function highlightCss(line: string): React.ReactNode {
  // Comments
  if (line.trim().startsWith("/*") || line.trim().startsWith("*")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  // Properties and values
  if (line.includes(":") && !line.includes("{") && !line.includes("//")) {
    const colonIdx = line.indexOf(":");
    const prop = line.slice(0, colonIdx);
    const val = line.slice(colonIdx + 1);
    return (
      <span>
        <span className="text-sky-300">{prop}</span>
        <span className="text-slate-500">:</span>
        <span className="text-amber-200">{val}</span>
      </span>
    );
  }
  // Selectors & braces
  if (line.includes("{") || line.includes("}")) {
    return <span className="text-violet-400">{line}</span>;
  }
  return <span className="text-slate-300">{line}</span>;
}

function highlightJs(line: string): React.ReactNode {
  const comments = /(\/\/.*$)/;
  const commentMatch = line.match(comments);
  if (commentMatch) {
    const idx = line.indexOf(commentMatch[0]);
    return (
      <span>
        <span>{highlightJsTokens(line.slice(0, idx))}</span>
        <span className="text-slate-500 italic">{commentMatch[0]}</span>
      </span>
    );
  }
  return highlightJsTokens(line);
}

function highlightJsTokens(line: string): React.ReactNode {
  const parts = line.split(/(\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw|default|switch|case|break|continue|typeof|instanceof|in|of|true|false|null|undefined|void|delete|yield)\b|".*?"|'.*?'|`.*?`|\b\d+\.?\d*\b)/g);
  return parts.map((part, i) => {
    if (/^(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw|default|switch|case|break|continue|typeof|instanceof|in|of|void|delete|yield)$/.test(part)) {
      return <span key={i} className="text-violet-400 font-medium">{part}</span>;
    }
    if (/^(true|false|null|undefined)$/.test(part)) {
      return <span key={i} className="text-amber-300">{part}</span>;
    }
    if (/^\d/.test(part)) {
      return <span key={i} className="text-emerald-300">{part}</span>;
    }
    if (/^["'`]/.test(part)) {
      return <span key={i} className="text-emerald-400">{part}</span>;
    }
    return <span key={i} className="text-slate-300">{part}</span>;
  });
}

const fileIcons: Record<string, React.ReactNode> = {
  "index.html": <FileCode size={14} className="text-orange-400" />,
  "style.css": <Paintbrush size={14} className="text-sky-400" />,
  "script.js": <Zap size={14} className="text-yellow-400" />,
};

interface CodeEditorProps {
  html: string;
}

export function CodeEditor({ html }: CodeEditorProps) {
  const files = useMemo(() => parseHtmlToFiles(html), [html]);
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showTree, setShowTree] = useState(true);

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "hsl(225, 15%, 13%)" }}>
        <div className="text-center text-slate-500">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No code generated yet</p>
          <p className="text-xs mt-1">Send a message to start building</p>
        </div>
      </div>
    );
  }

  const currentFile = files[activeFile] || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(html);
    toast.success("Full code copied!");
  };

  const handleDownloadAll = () => {
    downloadProjectFiles(files, "hexa-project");
    toast.success("Files downloading!");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "hsl(225, 15%, 13%)" }}>
      {/* Tab Bar - dark editor style */}
      <div className="flex items-center justify-between shrink-0" style={{ background: "hsl(225, 15%, 10%)", borderBottom: "1px solid hsl(225, 10%, 18%)" }}>
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setShowTree(!showTree)}
            className="p-2.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Toggle file tree"
          >
            <Files size={14} />
          </button>
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                i === activeFile
                  ? "text-slate-200 border-b-2 border-violet-500"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              style={i === activeFile ? { background: "hsl(225, 15%, 13%)" } : undefined}
            >
              {fileIcons[file.name] || <FileText size={14} />}
              {file.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 pr-2 shrink-0">
          <button onClick={handleCopy} className="p-1.5 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Copy file">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          <button onClick={handleCopyAll} className="p-1.5 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Copy all">
            <FileCode size={14} />
          </button>
          <button onClick={handleDownloadAll} className="p-1.5 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Download all">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Tree - dark sidebar */}
        {showTree && (
          <div className="w-48 shrink-0 overflow-y-auto" style={{ background: "hsl(225, 15%, 11%)", borderRight: "1px solid hsl(225, 10%, 18%)" }}>
            <div className="px-3 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Explorer
            </div>
            <div className="px-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400">
                <FolderOpen size={13} className="text-violet-400" />
                <span className="font-medium">hexa-project</span>
              </div>
              {files.map((file, i) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(i)}
                  className={`flex items-center gap-1.5 w-full px-2 py-1 pl-6 text-xs rounded transition-colors ${
                    i === activeFile
                      ? "bg-violet-500/15 text-slate-200"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                  }`}
                >
                  {fileIcons[file.name] || <FileText size={13} />}
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-[13px] font-mono leading-6">
            <code>{highlightCode(currentFile.content, currentFile.language)}</code>
          </pre>
        </div>
      </div>

      {/* Status Bar - VS Code style */}
      <div className="flex items-center justify-between px-3 py-1 shrink-0 text-[10px]" style={{ background: "hsl(262, 60%, 45%)" }}>
        <div className="flex items-center gap-3 text-white/80">
          <span>{currentFile.language.toUpperCase()}</span>
          <span>{currentFile.content.split("\n").length} lines</span>
          <span>{currentFile.content.length} chars</span>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <span>UTF-8</span>
          <span>Hexa.AI</span>
        </div>
      </div>
    </div>
  );
}
