import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editorStore";
import {
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** 顶部工具栏：新建 / 打开 / 保存 / 导出 HTML / 主题切换 */
export function Toolbar() {
  const newFile = useEditorStore((s) => s.newFile);
  const openFile = useEditorStore((s) => s.openFile);
  const saveFile = useEditorStore((s) => s.saveFile);
  const exportHtml = useEditorStore((s) => s.exportHtml);
  const theme = useEditorStore((s) => s.theme);
  const toggleTheme = useEditorStore((s) => s.toggleTheme);

  const themeIcon =
    theme === "dark" ? <Sun /> : theme === "light" ? <Moon /> : <Monitor />;
  const themeTitle =
    theme === "dark"
      ? "切换为亮色"
      : theme === "light"
        ? "切换为跟随系统"
        : "切换为暗色";

  return (
    <header className="flex h-11 shrink-0 items-center gap-0.5 border-b bg-background px-2">
      <span className="mr-2 select-none px-2 text-sm font-semibold">
        DevDoc
      </span>

      <Button
        variant="ghost"
        size="sm"
        title="新建文档 (Ctrl+N)"
        onClick={newFile}
      >
        <FilePlus />
        新建
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="打开文件 (Ctrl+O)"
        onClick={openFile}
      >
        <FolderOpen />
        打开
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="保存 (Ctrl+S)"
        onClick={saveFile}
      >
        <Save />
        保存
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="导出 HTML (Ctrl+E)"
        onClick={exportHtml}
      >
        <Download />
        导出 HTML
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        title={themeTitle}
        onClick={toggleTheme}
        className={cn(theme === "system" && "text-muted-foreground")}
      >
        {themeIcon}
      </Button>
    </header>
  );
}
