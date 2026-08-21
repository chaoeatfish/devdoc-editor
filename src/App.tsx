import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Toaster } from "sonner";
import { ListTree } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { Toolbar } from "@/components/Toolbar/Toolbar";
import { Editor } from "@/components/Editor/Editor";
import { Preview } from "@/components/Preview/Preview";
import { StatusBar } from "@/components/StatusBar/StatusBar";
import { TOC } from "@/components/TOC/TOC";
import { useEditorStore } from "@/store/editorStore";
import { useTheme } from "@/hooks/useTheme";
import { useAutoSave, readAutosave } from "@/hooks/useAutoSave";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { cn } from "@/lib/utils";

/**
 * 应用壳层：
 * - 顶部工具栏、中部编辑/预览分屏 + 目录侧边栏、底部状态栏。
 * - 全局快捷键（新建/打开/保存/导出）。
 * - 启动时检测自动保存内容并提示恢复。
 */
export function App() {
  useTheme();
  useAutoSave();

  const [split, setSplit] = useState(50); // 编辑区宽度百分比
  const [tocOpen, setTocOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useSyncScroll(editorScrollRef, previewScrollRef);

  const newFile = useEditorStore((s) => s.newFile);
  const openFile = useEditorStore((s) => s.openFile);
  const openFileFromPath = useEditorStore((s) => s.openFileFromPath);
  const saveFile = useEditorStore((s) => s.saveFile);
  const exportHtml = useEditorStore((s) => s.exportHtml);
  const restoreFromAutosave = useEditorStore((s) => s.restoreFromAutosave);
  const theme = useEditorStore((s) => s.theme);
  const editorVisible = useEditorStore((s) => s.editorVisible);

  // 启动时检测自动保存内容
  useEffect(() => {
    let cancelled = false;
    readAutosave().then((text) => {
      if (cancelled || !text) return;
      const ok = window.confirm("检测到未保存的文档，是否恢复？");
      if (ok) restoreFromAutosave(text);
    });
    return () => {
      cancelled = true;
    };
  }, [restoreFromAutosave]);

  // 处理从资源管理器打开的文件（启动时 CLI 参数 / 第二实例事件）
  useEffect(() => {
    // 检查启动时是否有文件参数
    invoke<string | null>("get_startup_file").then((path) => {
      if (path) openFileFromPath(path);
    });

    // 监听从第二个实例传来的文件路径事件
    const unlisten = listen<string>("open-file", (event) => {
      openFileFromPath(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [openFileFromPath]);

  // 全局快捷键
  useHotkeys("ctrl+n, cmd+n", (e) => {
    e.preventDefault();
    newFile();
  });
  useHotkeys("ctrl+o, cmd+o", (e) => {
    e.preventDefault();
    openFile();
  });
  useHotkeys("ctrl+s, cmd+s", (e) => {
    e.preventDefault();
    saveFile();
  });
  useHotkeys("ctrl+e, cmd+e", (e) => {
    e.preventDefault();
    exportHtml();
  });

  // 拖拽分隔条调整编辑/预览宽度
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(80, Math.max(20, percent)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = () => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Toolbar />

      <div ref={containerRef} className="flex flex-1 min-h-0">
        {/* 编辑区 */}
        {editorVisible && (
          <>
            <div
              style={{ width: `${split}%` }}
              className="min-w-0 shrink-0 bg-background"
            >
              <Editor scrollRef={editorScrollRef} />
            </div>

            {/* 拖拽分隔条 */}
            <div
              onMouseDown={startDrag}
              className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary/40 active:bg-primary/60"
            />
          </>
        )}

        {/* 预览区 */}
        <div className="min-w-0 flex-1 bg-background">
          <Preview scrollRef={previewScrollRef} />
        </div>

        {/* 目录大纲侧边栏 */}
        {tocOpen ? (
          <aside className="w-60 shrink-0 overflow-y-auto border-l bg-background">
            <TOC onNavigate={() => setTocOpen(false)} />
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setTocOpen(true)}
            title="显示目录"
            className={cn(
              "flex w-7 shrink-0 flex-col items-center justify-start border-l pt-2 text-muted-foreground",
              "transition-colors hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ListTree className="h-4 w-4" />
          </button>
        )}
      </div>

      <StatusBar />
      <Toaster
        theme={theme === "system" ? "system" : theme}
        position="bottom-right"
        richColors
      />
    </div>
  );
}
