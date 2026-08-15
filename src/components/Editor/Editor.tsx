import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import {
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEditorStore } from "@/store/editorStore";

/**
 * Markdown 编辑器（CodeMirror 6）：
 * - 支持行号、语法高亮、自动缩进、历史记录。
 * - 与 Zustand store 双向绑定：编辑时更新 `content`，
 *   外部变更（打开/新建/恢复）时同步回编辑器。
 */
export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef<Compartment | null>(null);
  const applyingExternalRef = useRef(false);

  const content = useEditorStore((state) => state.content);
  const setContent = useEditorStore((state) => state.setContent);
  const theme = useEditorStore((state) => state.theme);

  // 创建编辑器（仅一次）
  useEffect(() => {
    if (!containerRef.current) return;

    const themeCompartment = new Compartment();
    themeCompartmentRef.current = themeCompartment;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        themeCompartment.of(theme === "dark" ? oneDark : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !applyingExternalRef.current) {
            setContent(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      themeCompartmentRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部内容变化时同步到编辑器
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== content) {
      applyingExternalRef.current = true;
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      });
      applyingExternalRef.current = false;
    }
  }, [content]);

  // 主题切换
  useEffect(() => {
    const view = viewRef.current;
    const comp = themeCompartmentRef.current;
    if (!view || !comp) return;
    view.dispatch({
      effects: comp.reconfigure(theme === "dark" ? oneDark : []),
    });
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden [&_.cm-editor]:h-full [&_.cm-editor]:text-[14px]"
    />
  );
}
