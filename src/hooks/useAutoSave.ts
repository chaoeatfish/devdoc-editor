import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useEditorStore } from "@/store/editorStore";

/** 自动保存间隔（毫秒） */
export const AUTOSAVE_INTERVAL = 30_000;

/**
 * 自动保存：
 * - 每 30 秒将未保存到真实文件的草稿写入 `<app_data_dir>/autosave.md`。
 * - 已保存到真实文件的文档由手动保存覆盖，无需自动保存。
 */
export function useAutoSave() {
  const content = useEditorStore((state) => state.content);
  const filePath = useEditorStore((state) => state.filePath);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!filePath && content.trim()) {
        invoke("save_autosave", { content }).catch(() => {
          // 静默失败，不打扰用户
        });
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [content, filePath]);
}

/**
 * 启动时读取自动保存文件，返回内容（不存在或为空时为 null）。
 */
export async function readAutosave(): Promise<string | null> {
  try {
    return await invoke<string | null>("read_autosave");
  } catch {
    return null;
  }
}
