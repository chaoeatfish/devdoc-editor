import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useEditorStore } from "@/store/editorStore";

// 模块级初始化一次（不依赖 DOM）
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

let uidCounter = 0;

interface MermaidRendererProps {
  code: string;
}

/**
 * Mermaid 图表渲染器：
 * - 接收 `code`（mermaid 图定义），渲染为内联 SVG。
 * - 缓存结果避免重复渲染；错误时显示友好占位。
 * - 根据全局主题切换明暗。
 */
export function MermaidRenderer({ code }: MermaidRendererProps) {
  const theme = useEditorStore((state) => state.theme);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${++uidCounter}`);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    mermaid
      .render(idRef.current, code)
      .then(({ svg: result }) => {
        if (!cancelled) setSvg(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [code, theme]);

  if (error) {
    return (
      <div className="my-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        <p className="font-medium">图表渲染失败</p>
        <pre className="mt-1 whitespace-pre-wrap text-xs opacity-80">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        正在渲染图表…
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
