interface PreviewPaneProps {
  html: string;
  view: "preview" | "code";
}

export function PreviewPane({ html, view }: PreviewPaneProps) {
  if (view === "code") {
    return (
      <div className="flex-1 overflow-auto bg-code-bg p-4">
        <pre className="text-code-fg text-sm font-mono whitespace-pre-wrap break-words">
          {html || "// No code generated yet. Send a message to get started."}
        </pre>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex-1 flex items-center justify-center bg-builder-canvas">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-3">🚀</div>
          <p className="text-lg font-medium">Ready to build</p>
          <p className="text-sm">Describe your website below to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-builder-canvas">
      <iframe
        srcDoc={html}
        title="Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
