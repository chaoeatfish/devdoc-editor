import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

/** 底部状态栏：保存状态 / 字数 / 字符数 / 行数 / 文件路径 */
export function StatusBar() {
  const content = useEditorStore((s) => s.content);
  const filePath = useEditorStore((s) => s.filePath);
  const isDirty = useEditorStore((s) => s.isDirty);

  const chars = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content.length ? content.split("\n").length : 0;

  return (
    <footer className="flex h-6 shrink-0 items-center gap-4 border-t bg-background px-3 text-xs text-muted-foreground">
      <span
        className={cn(
          "flex items-center gap-1.5",
          isDirty && "font-medium text-amber-500",
        )}
      >
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            isDirty ? "bg-amber-500" : "bg-emerald-500",
          )}
        />
        {isDirty ? "未保存" : "已保存"}
      </span>
      <span>字数 {words}</span>
      <span>字符 {chars}</span>
      <span>行数 {lines}</span>
      <span className="ml-auto max-w-[50%] truncate">
        {filePath ?? "未命名文档"}
      </span>
    </footer>
  );
}
