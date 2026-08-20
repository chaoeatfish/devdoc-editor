import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";

/**
 * 同步编辑器和预览区的滚动位置
 * 基于滚动百分比进行同步
 */
export function useSyncScroll(
  editorRef: React.RefObject<HTMLElement | null>,
  previewRef: React.RefObject<HTMLElement | null>
) {
  const syncScroll = useEditorStore((s) => s.syncScroll);
  const isSyncingRef = useRef(false);

  const syncScrollPositions = useCallback(
    (source: HTMLElement, target: HTMLElement) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      const sourceScrollHeight = source.scrollHeight - source.clientHeight;
      const targetScrollHeight = target.scrollHeight - target.clientHeight;

      if (sourceScrollHeight > 0 && targetScrollHeight > 0) {
        const scrollPercent = source.scrollTop / sourceScrollHeight;
        target.scrollTop = scrollPercent * targetScrollHeight;
      }

      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    },
    []
  );

  useEffect(() => {
    if (!syncScroll) return;

    const editorContainer = editorRef.current;
    const preview = previewRef.current;
    if (!editorContainer || !preview) return;

    // CodeMirror 的滚动容器是 .cm-scroller
    const cmScroller = editorContainer.querySelector(".cm-scroller") as HTMLElement | null;
    if (!cmScroller) return;

    const handleEditorScroll = () => {
      syncScrollPositions(cmScroller, preview);
    };

    const handlePreviewScroll = () => {
      syncScrollPositions(preview, cmScroller);
    };

    cmScroller.addEventListener("scroll", handleEditorScroll, { passive: true });
    preview.addEventListener("scroll", handlePreviewScroll, { passive: true });

    return () => {
      cmScroller.removeEventListener("scroll", handleEditorScroll);
      preview.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [syncScroll, editorRef, previewRef, syncScrollPositions]);
}
