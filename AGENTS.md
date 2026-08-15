# AGENTS.md – DevDoc Markdown Editor

> 本文档为 AI 编程助手（如 GitHub Copilot、Cursor、Codeium）提供项目开发指引，确保协作高效、代码一致、符合 PRD 与 TECH_DESIGN。

---

## 1. 项目身份

- **项目名称**：DevDoc Markdown Editor（桌面端）
- **核心目标**：轻量、离线、高性能的 Markdown 文档编辑器，支持 GFM、代码高亮、Mermaid 图表、导出 HTML。
- **开发模式**：Vibe Coding（AI 辅助编程），1~2 天内完成可运行 MVP。
- **运行环境**：Windows / macOS / Linux（Tauri 桌面应用）。

---

## 2. 技术栈（严格遵循）

| 类别           | 选型                                                        |
| -------------- | ----------------------------------------------------------- |
| 桌面框架       | Tauri v2 (Rust 后端)                                        |
| 前端框架       | React 18 + TypeScript + Vite                                |
| 样式           | Tailwind CSS + shadcn/ui（暗色主题支持）                    |
| 状态管理       | Zustand（单 store，轻量）                                   |
| Markdown 渲染  | `react-markdown` + `remark-gfm` + `rehype-highlight`       |
| 图表           | `mermaid`（v10+）                                           |
| 编辑器组件     | CodeMirror 6（`@codemirror/lang-markdown` + 行号等）        |
| 本地存储       | `tauri-plugin-store`（设置）+ Tauri fs（文件读写）         |
| 快捷键         | `react-hotkeys-hook`                                       |
| 构建/打包      | Tauri CLI + Vite                                           |

---

## 3. 目录结构约定

（使用缩进列表，便于复制）
/
src-tauri/
src/
main.rs
commands.rs
store.rs
Cargo.toml
src/
components/
Editor/
Preview/
Toolbar/
StatusBar/
TOC/
ui/
store/
editorStore.ts
hooks/
useAutoSave.ts
useTheme.ts
lib/
markdown.ts
export.ts
styles/
globals.css
App.tsx
main.tsx
public/
index.html
package.json
tailwind.config.js
vite.config.ts
tauri.conf.json

---

## 4. 编码规范（AI 助手必须遵守）

### 4.1 TypeScript
- 使用 **strict** 模式，所有函数参数/返回值显式类型。
- 优先使用 `interface` 定义对象，`type` 用于联合/工具类型。
- 避免 `any`，必要时使用 `unknown` 并做类型守卫。

### 4.2 React 组件
- **函数组件** + 命名导出（`export function ComponentName`）。
- Props 类型单独定义（`interface ComponentNameProps`）。
- 使用 **shadcn/ui** 组件，通过 `cn()` 合并类名（来自 `@/lib/utils`）。
- 所有组件置于 `src/components/` 下，按功能分文件夹。

### 4.3 状态管理（Zustand）
- 单一 Store：`src/store/editorStore.ts`，包含状态和动作。
- 动作命名以动词开头（`setContent`, `openFile`, `saveFile` 等）。
- 异步操作使用 `async/await`，错误通过 Toast 提示（使用 `sonner` 或 shadcn toast）。

### 4.4 样式（Tailwind）
- 优先使用 Tailwind 工具类，避免自定义 CSS（除非必要）。
- 暗色主题通过 `dark:` 前缀实现，跟随系统或用户切换。
- 字体、间距、颜色参考 shadcn 默认设计令牌。

### 4.5 文件/路径
- 使用 Tauri 提供的 `@tauri-apps/api/path` 处理跨平台路径。
- 所有文件读写操作通过 Tauri 命令（`invoke`）调用 Rust 后端。

### 4.6 错误处理
- 所有 Tauri 调用包裹 `try-catch`，出现错误时显示用户友好提示。
- 预览渲染错误（如 Mermaid 失败）显示占位信息，不崩溃应用。

---

## 5. 关键模块开发指引

### 5.1 编辑器（Editor）
- **实现文件**：`src/components/Editor/Editor.tsx`
- **技术**：`@codemirror/basic-setup` + `@codemirror/lang-markdown` + `@codemirror/state`
- **必须支持**：行号、Markdown 语法高亮、自动缩进、快捷键（Ctrl+S 保存等）。
- **双向绑定**：`value` 与 store 的 `content` 同步，`onChange` 更新 store。

### 5.2 预览（Preview）
- **实现文件**：`src/components/Preview/Preview.tsx`
- **核心**：`react-markdown` + 自定义组件映射。
- **代码块处理**：
  - 语言为 `mermaid` → 使用 `MermaidRenderer` 组件。
  - 其他 → 使用 `rehype-highlight` 自动高亮（或 `SyntaxHighlighter` 封装）。
- **表格、任务列表**：通过 `remark-gfm` 自动支持，需额外样式（边框、对齐）。
- **防抖**：预览更新延迟 300ms（在 store 或父组件使用 `useDebounce`）。

### 5.3 Mermaid 渲染器
- **实现文件**：`src/components/Preview/MermaidRenderer.tsx`
- **逻辑**：
  - 接收 `code` 字符串和 `id`（唯一）。
  - 调用 `mermaid.render(id, code)`，将生成的 SVG 放入 `dangerouslySetInnerHTML`（但内容来自可信源）。
  - 缓存已渲染结果（`useMemo` 基于 code）。
  - 错误时显示 "图表渲染失败" 提示。

### 5.4 目录大纲（TOC）
- **实现文件**：`src/components/TOC/TOC.tsx`
- **解析**：使用 `remark` 解析当前 content，提取 `heading` 节点（深度 1~6）。
- **展示**：树形列表，点击后滚动到预览区对应标题（通过给标题添加 id 或使用 `scrollIntoView`）。
- **位置**：悬浮侧边栏（可折叠），位于预览区右侧或独立面板。

### 5.5 文件操作（Tauri 命令）
- **实现位置**：`src-tauri/src/commands.rs`
- **命令列表**：
  - `open_file_dialog()` → 返回 `(path, content)`
  - `save_file_dialog(content)` → 返回保存路径
  - `save_file(path, content)` → 直接写入
  - `export_html(content, title?)` → 生成完整 HTML 并保存（可前端生成后调用 `save_file`）
- **安全 scope**：在 `tauri.conf.json` 的 `allowlist.fs.scope` 中允许 `$APPDATA`、`$DOCUMENT` 等。

### 5.6 自动保存与恢复
- **实现文件**：`src/hooks/useAutoSave.ts`
- **逻辑**：
  - 每 30 秒调用 `tauri` 命令，将当前 `content` 写入 `$APPDATA/devdoc-editor/autosave.md`。
  - 应用启动时，尝试读取该文件，若存在且非空，弹窗询问是否恢复。
  - 用户确认后加载到编辑器。

### 5.7 导出 HTML
- **实现文件**：`src/lib/export.ts`
- **做法**：
  - 使用 `ReactDOMServer.renderToStaticMarkup` 渲染 `<Preview>` 组件（注意提供必要的 context）。
  - 提取编译后的 Tailwind CSS（从构建产物或内联）和 highlight.js/mermaid 主题样式。
  - 生成完整 HTML，包含 `<html>`、`<head>`（样式）和 `<body>`（预览内容）。
  - 通过 Tauri `save_file_dialog` 让用户选择保存路径，写入 `.html` 文件。

### 5.8 主题切换
- **实现文件**：`src/hooks/useTheme.ts`
- **机制**：
  - 在 `html` 元素上切换 `dark` class。
  - 使用 `useEffect` 监听系统主题变化（`window.matchMedia`）或 store 中的用户偏好。
  - shadcn/ui 默认适配暗色，无需额外配置。

---

## 6. 开发任务分解（Vibe Coding 节奏）

### Day 1（上午）：项目初始化 + 基础布局
- [ ] 创建 Tauri + React + TypeScript 项目（`pnpm create tauri-app`）。
- [ ] 安装 Tailwind CSS、shadcn/ui（初始化并配置）。
- [ ] 设置 Zustand store（初始 content、主题、文件路径）。
- [ ] 实现分屏布局（编辑区 50% / 预览区 50%，可拖拽调整宽度）。
- [ ] 集成 CodeMirror 6，绑定 store。
- [ ] 搭建工具栏（新建、打开、保存按钮，待绑定命令）。

### Day 1（下午）：文件操作 + 基础预览
- [ ] 实现 Tauri 文件对话框命令（打开、保存）。
- [ ] 连接工具栏按钮与 store 动作。
- [ ] 集成 `react-markdown` + `remark-gfm`，完成基础渲染（标题、列表、链接、图片）。
- [ ] 添加代码高亮（`rehype-highlight`）。
- [ ] 实现状态栏（字数/行数统计）。
- [ ] 实现自动保存（定时写入 autosave.md）和启动恢复提示。

### Day 2（上午）：高级渲染 + 主题
- [ ] 集成 Mermaid 图表（自定义 `code` 组件）。
- [ ] 完善表格、任务列表样式。
- [ ] 实现暗色/亮色主题切换（跟随系统 + 手动切换）。
- [ ] 实现目录大纲（提取标题，侧边栏展示）。
- [ ] 添加快捷键（保存、新建、打开、导出、主题切换）。

### Day 2（下午）：导出 + 测试与打包
- [ ] 实现导出 HTML（前端生成完整页面，后端写入）。
- [ ] 测试所有功能（打开、编辑、保存、预览、导出、自动恢复、主题）。
- [ ] 修复已知 bug（特别是 Mermaid 渲染和路径问题）。
- [ ] 配置 Tauri 打包（图标、产品名、allowlist）。
- [ ] 生成各平台安装包（Windows `.msi` / macOS `.dmg` / Linux `.AppImage` 或 `.deb`）。
- [ ] 编写简单的用户文档（README.md）。

---

## 7. 常见问题与注意事项（给 AI 的提示）

- **Mermaid 渲染时机**：必须等待 DOM 挂载完成后调用 `mermaid.initialize` 和 `render`，避免在 SSR 或未加载时执行。
- **文件路径编码**：Tauri 返回的路径为字符串，处理时使用 `path.sep` 或 `path.join` 确保跨平台。
- **预览防抖**：使用 `useDebounce`（或 `setTimeout` 清理）避免每按键都重渲染。
- **导出 HTML 样式完整性**：务必复制所有使用到的 CSS（Tailwind 工具类、highlight.js 样式、mermaid 默认主题），否则导出页面样式错乱。
- **自动保存冲突**：当用户手动保存时，应清除自动保存文件（或覆盖），避免恢复旧内容。
- **快捷键冲突**：避免与系统全局快捷键冲突（如 Ctrl+S 在 Tauri 中默认会触发浏览器的保存，需使用 `preventDefault` 或 Tauri 的全局快捷键 API）。

---

## 8. 测试与验收

- **手动测试清单**：
  1. 新建文档 → 输入内容 → 预览即时更新。
  2. 保存为 `.md` → 关闭应用 → 重新打开，自动恢复未保存内容。
  3. 打开已有 `.md` 文件 → 显示正确（含代码块、表格、Mermaid）。
  4. 切换主题 → 编辑/预览区颜色变化。
  5. 导出 HTML → 离线打开，样式完整，图表可交互（若 Mermaid 使用 SVG 则静态）。
  6. 目录大纲 → 点击跳转。
  7. 统计信息 → 数字正确。
  8. 快捷键 → 功能触发。

- **性能要求**：
  - 编辑延迟 < 50ms。
  - 预览渲染 < 300ms（含图表）。
  - 支持 10 万字文档无明显卡顿。

---

## 9. 交付物

- 源码仓库（GitHub 或本地）。
- 各平台安装包（`.msi`, `.dmg`, `.AppImage` 或 `.deb`）。
- README（构建、运行、打包说明）。
- 可选：演示视频或截图。

---

## 10. AI 助手行为准则

1. **遵循本 AGENTS.md** 中的所有规范，不得擅自更换技术栈或架构。
2. **生成代码时优先复用现有组件和工具函数**，减少冗余。
3. **遇到不确定的 API 用法时**，先查询官方文档（Tauri、React、Mermaid）或给出替代方案。
4. **所有新增依赖需与项目目标一致**（轻量、离线），避免引入重型库。
5. **在生成代码后，主动检查类型错误和 lint 问题**（ESLint/Prettier）。
6. **保持沟通透明**：若无法在 1~2 天内完成 MVP，及时提出简化方案或调整优先级。

---

**祝开发顺利！** 🚀