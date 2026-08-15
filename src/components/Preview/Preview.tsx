import { memo, useEffect, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { useEditorStore } from "@/store/editorStore";
import { MermaidRenderer } from "./MermaidRenderer";

/** 预览防抖延迟（毫秒） */
const DEBOUNCE_MS = 300;

/**
 * 自定义代码块渲染：
 * - `language-mermaid` 的代码块交给 MermaidRenderer。
 * - 其余代码块由 rehype-highlight 负责高亮。
 */
function CodeBlock({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const match = /language-(\w+)/.exec(className ?? "");

  if (match && match[1].toLowerCase() === "mermaid") {
    const code = String(children).replace(/\n$/, "");
    return <MermaidRenderer code={code} />;
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

interface PreviewProps {
  /** 直接指定渲染内容（用于导出等场景）；默认从 store 读取 */
  content?: string;
}

function PreviewInner({ content: externalContent }: PreviewProps) {
  const storeContent = useEditorStore((state) => state.content);
  const raw = externalContent ?? storeContent;

  // 300ms 防抖，避免每次按键都重渲染
  const [content, setContent] = useState(raw);
  useEffect(() => {
    const timer = setTimeout(() => setContent(raw), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [raw]);

  return (
    <div className="markdown-body h-full overflow-y-auto px-6 py-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeSlug]}
        components={{
          code: CodeBlock,
          input: (props) => <input type="checkbox" disabled {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const Preview = memo(PreviewInner);
