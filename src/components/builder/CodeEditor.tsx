import { useState, useMemo } from "react";
import { FileCode, FileText, Paintbrush, Zap, ChevronRight, Copy, Check, Download, FolderOpen, Files } from "lucide-react";
import { parseHtmlToFiles, downloadProjectFiles, type VirtualFile } from "@/lib/code-parser";
import { toast } from "sonner";

// Simple syntax highlighting
function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => (
    <div key={i} className="flex">
      <span className="select-none w-12 pr-4 text-right text-muted-foreground/40 text-xs shrink-0">{i + 1}</span>
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
      // Tag
      const tagParts = part.match(/^(<\/?)(\w+)(.*?)(\/?>)$/);
      if (tagParts) {
        return (
          <span key={i}>
            <span className="text-muted-foreground">{tagParts[1]}</span>
            <span className="text-[hsl(var(--primary))]">{tagParts[2]}</span>
            <span className="text-[hsl(var(--accent))]">{highlightAttributes(tagParts[3])}</span>
            <span className="text-muted-foreground">{tagParts[4]}</span>
          </span>
        );
      }
      return <span key={i} className="text-muted-foreground">{part}</span>;
    }
    return <span key={i} className="text-foreground">{part}</span>;
  });
}

function highlightAttributes(attrStr: string): React.ReactNode {
  return attrStr.split(/(".*?")/g).map((part, i) => {
    if (part.startsWith('"')) {
      return <span key={i} className="text-green-600 dark:text-green-400">{part}</span>;
    }
    return <span key={i} className="text-[hsl(var(--accent))]">{part}</span>;
  });
}

function highlightCss(line: string): React.ReactNode {
  // Properties and values
  if (line.includes(":") && !line.includes("{")) {
    const [prop, ...rest] = line.split(":");
    return (
      <span>
        <span className="text-[hsl(var(--primary))]">{prop}</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-green-600 dark:text-green-400">{rest.join(":")}</span>
      </span>
    );
  }
  // Selectors
  if (line.includes("{") || line.includes("}")) {
    return <span className="text-[hsl(var(--accent))]">{line}</span>;
  }
  return <span className="text-foreground">{line}</span>;
}

function highlightJs(line: string): React.ReactNode {
  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw)\b/g;
  const strings = /(".*?"|'.*?'|`.*?`)/g;
  const comments = /(\/\/.*$)/;
  
  // Check for comments first
  const commentMatch = line.match(comments);
  if (commentMatch) {
    const idx = line.indexOf(commentMatch[0]);
    return (
      <span>
        <span>{highlightJsTokens(line.slice(0, idx))}</span>
        <span className="text-muted-foreground/60 italic">{commentMatch[0]}</span>
      </span>
    );
  }
  
  return highlightJsTokens(line);
}

function highlightJsTokens(line: string): React.ReactNode {
  const parts = line.split(/(\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw)\b|".*?"|'.*?'|`.*?`)/g);
  return parts.map((part, i) => {
    if (/^(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw)$/.test(part)) {
      return <span key={i} className="text-[hsl(var(--primary))] font-medium">{part}</span>;
    }
    if (/^["'`]/.test(part)) {
      return <span key={i} className="text-green-600 dark:text-green-400">{part}</span>;
    }
    return <span key={i} className="text-foreground">{part}</span>;
  });
}

const fileIcons: Record<string, React.ReactNode> = {
  "index.html": <FileCode size={14} className="text-orange-500" />,
  "style.css": <Paintbrush size={14} className="text-blue-500" />,
  "script.js": <Zap size={14} className="text-yellow-500" />,
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
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--code-bg))]">
        <div className="text-center text-muted-foreground">
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(var(--code-bg))]">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between bg-card border-b border-border px-2 py-0 shrink-0">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setShowTree(!showTree)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors mr-1"
            title="Toggle file tree"
          >
            <Files size={14} />
          </button>
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                i === activeFile
                  ? "border-primary text-foreground bg-[hsl(var(--code-bg))]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {fileIcons[file.name] || <FileText size={14} />}
              {file.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={handleCopy} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy file">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button onClick={handleCopyAll} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy all code">
            <FileCode size={14} />
          </button>
          <button onClick={handleDownloadAll} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Download all files">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Tree */}
        {showTree && (
          <div className="w-48 border-r border-border bg-card shrink-0 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Explorer
            </div>
            <div className="px-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
                <FolderOpen size={13} className="text-primary" />
                <span className="font-medium">hexa-project</span>
              </div>
              {files.map((file, i) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(i)}
                  className={`flex items-center gap-1.5 w-full px-2 py-1 pl-6 text-xs rounded-md transition-colors ${
                    i === activeFile
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-primary text-primary-foreground text-[10px] shrink-0">
        <div className="flex items-center gap-3">
          <span>{currentFile.language.toUpperCase()}</span>
          <span>{currentFile.content.split("\n").length} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>Hexa.AI Builder</span>
        </div>
      </div>
    </div>
  );
}
