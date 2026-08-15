import { useMemo } from "react";
import { extractToc } from "@/lib/markdown";
import { useEditorStore } from "@/store/editorStore";

interface TOCProps {
  /** 点击标题跳转后的回调（用于收起侧边栏） */
  onNavigate?: () => void;
}

/**
 * 目录大纲：从当前内容提取标题，点击滚动到预览区对应标题。
 */
export function TOC({ onNavigate }: TOCProps) {
  const content = useEditorStore((s) => s.content);
  const items = useMemo(() => extractToc(content), [content]);

  const handleClick = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };

  return (
    <nav className="px-2 py-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        目录大纲
      </p>
      {items.length === 0 ? (
        <p className="px-2 py-1 text-xs text-muted-foreground/70">
          暂无标题
        </p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={`${item.id}-${item.text}`}>
              <button
                type="button"
                onClick={() => handleClick(item.id)}
                style={{ paddingLeft: `${(item.depth - 1) * 12 + 8}px` }}
                className="w-full truncate rounded px-1.5 py-1 text-left text-[13px] text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                title={item.text}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
