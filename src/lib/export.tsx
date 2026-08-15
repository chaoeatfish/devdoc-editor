import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { invoke } from "@tauri-apps/api/core";

// Vite 支持以原始字符串导入 CSS，用于导出时内联样式（离线可用）
import markdownCss from "@/styles/export.css?raw";
import hljsCss from "highlight.js/styles/github-dark.css?raw";
import katexCss from "katex/dist/katex.min.css?raw";

/**
 * 将 Markdown 渲染为完整独立的 HTML 文档，并通过保存对话框写入本地。
 * 所有样式（Markdown 基础样式、代码高亮、KaTeX）均内联，可离线打开。
 * 注意：Mermaid 图表依赖浏览器运行时渲染，导出文档中以代码块形式保留。
 */
export async function exportHtml(
  markdown: string,
  title: string,
): Promise<void> {
  const body = renderToStaticMarkup(
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </div>,
  );

  const htmlTitle = renderToStaticMarkup(<title>{title}</title>);

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${htmlTitle}
  <style>
${markdownCss}
${hljsCss}
${katexCss}
  </style>
</head>
<body>
  ${body}
</body>
</html>`;

  await invoke("save_html_dialog", { content: html });
}
