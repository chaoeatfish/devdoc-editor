import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";

/**
 * 主题管理：
 * - 根据 store 中的偏好（light / dark / system）在 `<html>` 上切换 `dark` class。
 * - 跟随系统主题变化（system 模式）。
 */
export function useTheme() {
  const theme = useEditorStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
      root.classList.toggle("dark", resolved === "dark");
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}
