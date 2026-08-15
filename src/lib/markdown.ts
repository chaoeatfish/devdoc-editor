import { remark } from "remark";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import type { Heading } from "mdast";

export interface TocItem {
  /** 与预览区标题元素对应的 DOM id（github-slugger 规则） */
  id: string;
  /** 标题层级 1~6 */
  depth: number;
  /** 标题文本 */
  text: string;
}

/**
 * 从 Markdown 内容中提取标题大纲（1~6 级）。
 * 使用 `github-slugger` 生成 id，与 Preview 组件中 `rehype-slug`
 * 生成的 id 完全一致，保证 TOC 点击能滚动到预览区对应标题。
 */
export function extractToc(markdown: string): TocItem[] {
  const tree = remark().parse(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  visit(tree, "heading", (node: Heading) => {
    const text = node.children
      .map((child) => ("value" in child ? child.value : ""))
      .join("")
      .trim();

    if (text) {
      items.push({
        id: slugger.slug(text),
        depth: node.depth,
        text,
      });
    }
  });

  return items;
}
