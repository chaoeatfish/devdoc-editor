import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export type Theme = "light" | "dark" | "system";

interface EditorState {
  /** 当前文档内容 */
  content: string;
  /** 当前打开/保存的文件路径，null 表示尚未命名 */
  filePath: string | null;
  /** 是否有未保存的更改 */
  isDirty: boolean;
  /** 主题偏好 */
  theme: Theme;
  /** 编辑器是否可见 */
  editorVisible: boolean;
  /** 同步滚动是否启用 */
  syncScroll: boolean;

  setContent: (text: string) => void;
  setFilePath: (path: string | null) => void;
  /** 新建文档（清空内容） */
  newFile: () => void;
  /** 打开文件对话框并加载内容 */
  openFile: () => Promise<void>;
  /** 保存（已有路径直接写，否则另存为） */
  saveFile: () => Promise<void>;
  /** 另存为 */
  saveFileAs: () => Promise<void>;
  /** 导出 HTML */
  exportHtml: () => Promise<void>;
  /** 恢复自动保存的内容 */
  restoreFromAutosave: (text: string) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** 切换编辑器可见性 */
  toggleEditor: () => void;
  /** 切换同步滚动 */
  toggleSyncScroll: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: "",
  filePath: null,
  isDirty: false,
  theme: "system",
  editorVisible: true,
  syncScroll: true,

  setContent: (text) => set({ content: text, isDirty: true }),

  setFilePath: (filePath) => set({ filePath }),

  newFile: () => {
    // 保存当前文档的自动保存内容已由 useAutoSave 处理
    set({ content: "", filePath: null, isDirty: false });
    toast("已新建文档");
  },

  openFile: async () => {
    try {
      const result = await invoke<[string, string] | null>("open_file_dialog");
      if (!result) return;
      const [path, text] = result;
      set({ content: text, filePath: path, isDirty: false });
      toast.success("已打开文件");
    } catch (error) {
      toast.error(`打开文件失败：${error}`);
    }
  },

  saveFile: async () => {
    const { content, filePath } = get();
    try {
      if (filePath) {
        await invoke("save_file", { path: filePath, content });
        set({ isDirty: false });
        toast.success("已保存");
      } else {
        await get().saveFileAs();
      }
    } catch (error) {
      toast.error(`保存失败：${error}`);
    }
  },

  saveFileAs: async () => {
    const { content } = get();
    try {
      const path = await invoke<string | null>("save_file_dialog", { content });
      if (!path) return;
      set({ filePath: path, isDirty: false });
      toast.success("已保存");
    } catch (error) {
      toast.error(`保存失败：${error}`);
    }
  },

  exportHtml: async () => {
    const { content, filePath } = get();
    try {
      const { exportHtml } = await import("@/lib/export");
      const title = filePath
        ? filePath.split(/[\\/]/).pop()?.replace(/\.md$/i, "") ?? "未命名文档"
        : "未命名文档";
      await exportHtml(content, title);
      toast.success("已导出 HTML");
    } catch (error) {
      toast.error(`导出失败：${error}`);
    }
  },

  restoreFromAutosave: (text) =>
    set({ content: text, filePath: null, isDirty: true }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () => {
    const { theme } = get();
    const next: Theme =
      theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    set({ theme: next });
  },

  toggleEditor: () => {
    const { editorVisible } = get();
    set({ editorVisible: !editorVisible });
  },

  toggleSyncScroll: () => {
    const { syncScroll } = get();
    set({ syncScroll: !syncScroll });
  },
}));
