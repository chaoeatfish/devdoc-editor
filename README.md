<div align="center">

# 📝 DevDoc Markdown Editor

**轻量 · 离线 · 高性能的 Markdown 桌面编辑器**

基于 Tauri v2 + React + TypeScript 构建，支持 GFM、代码高亮、Mermaid 图表、数学公式与一键导出 HTML。

</div>

---

## ✨ 功能特性

| 功能 | 说明 |
| --- | --- |
| 🖥️ **左右分屏编辑** | 左侧 CodeMirror 6 编辑器（行号、语法高亮、撤销历史），右侧实时预览，中间分隔条可拖拽调整宽度（20% ~ 80%） |
| 👁️ **编辑器隐藏** | 一键隐藏整个编辑区板块，预览区占满屏幕，沉浸式阅读体验 |
| 🔄 **同步滚动** | 编辑器与预览区同步滚动，基于滚动百分比精准对齐，可通过工具栏开关 |
| ⚡ **实时预览** | Markdown 渲染带 300ms 防抖，连续输入不卡顿 |
| 📊 **Mermaid 图表** | 代码块标注 `mermaid` 语言即自动渲染为 SVG 图表（流程图、时序图、饼图等），支持明暗主题 |
| 🧮 **数学公式** | KaTeX 渲染 LaTeX 公式（`$...$` / `$$...$$`） |
| 🔍 **代码高亮** | highlight.js 自动识别并高亮代码块 |
| 📑 **目录大纲** | 右侧可折叠侧边栏，自动提取 1~6 级标题，点击平滑滚动跳转 |
| 📋 **GFM 支持** | 表格、任务列表等 GitHub 风格 Markdown |
| 📁 **文件操作** | 新建 / 打开（`.md`、`.markdown`、`.txt`）/ 保存 / 另存为 |
| 📤 **导出 HTML** | 生成完整独立的 HTML 文档，所有样式内联，**离线可打开** |
| 💾 **自动保存** | 每 30 秒将未保存草稿写入应用数据目录，启动时提示恢复 |
| 🌗 **主题切换** | 亮色 / 暗色 / 跟随系统，三态循环切换 |
| ⌨️ **快捷键** | 新建、打开、保存、导出均支持快捷键（Windows/Linux 用 Ctrl，macOS 用 Cmd） |
| 📊 **状态栏** | 实时显示保存状态、字数、字符数、行数、文件路径 |

---

## 🛠️ 技术栈

| 类别 | 选型 |
| --- | --- |
| 桌面框架 | [Tauri v2](https://tauri.app/)（Rust 后端） |
| 前端框架 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS + shadcn/ui（暗色主题支持） |
| 状态管理 | Zustand（单一 Store） |
| 编辑器 | CodeMirror 6（`@codemirror/lang-markdown`） |
| Markdown 渲染 | react-markdown + remark-gfm + rehype-highlight |
| 图表 | Mermaid v10 |
| 数学公式 | KaTeX（remark-math + rehype-katex） |
| 文件对话框 | `tauri-plugin-dialog` |
| 本地存储 | Tauri fs + `tauri-plugin-store` |
| 快捷键 | react-hotkeys-hook |

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 | 说明 |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | ≥ 20.19 | 建议使用最新的 LTS 版本 |
| [pnpm](https://pnpm.io/) | ≥ 9 | 包管理器（本项目使用 pnpm） |
| [Rust](https://www.rust-lang.org/) | 最新 stable | 编译 Tauri 后端 |
| 系统依赖 | 见下方 | 各平台不同 |

**Windows**：需要 [Microsoft Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)（勾选 "Desktop development with C++"）和 WebView2 运行时（Windows 10/11 通常已内置）。

**macOS**：需要 Xcode Command Line Tools（`xcode-select --install`）。

**Linux**：需要 `webkit2gtk-4.1`、`libgtk-3-dev` 等系统包，参考 [Tauri 官方文档](https://tauri.app/start/prerequisites/)。

### 安装依赖

```bash
pnpm install
```

### 开发模式（热更新 + 打开桌面窗口）

```bash
pnpm tauri dev
```

### 打包安装包

```bash
pnpm tauri build
```

打包产物位于 `src-tauri/target/release/bundle/`（Windows 生成 `.msi` / `.exe`，macOS 生成 `.dmg`，Linux 生成 `.AppImage` / `.deb`）。

> 仅构建前端（不打包桌面应用）：`pnpm build`

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl+N` / `Cmd+N` | 新建文档 |
| `Ctrl+O` / `Cmd+O` | 打开文件 |
| `Ctrl+S` / `Cmd+S` | 保存（无路径时弹出另存为） |
| `Ctrl+E` / `Cmd+E` | 导出 HTML |
| `Ctrl+Z` / `Cmd+Z` | 撤销（编辑器内） |
| `Tab` | 缩进（编辑器内） |

---

## 🗂️ 项目结构

```
devdoc-editor/
├── src/                      # 前端（界面）
│   ├── main.tsx              # 程序入口
│   ├── App.tsx               # 应用壳层：布局、快捷键、启动恢复
│   ├── store/
│   │   └── editorStore.ts    # 全局状态（Zustand 单一 Store）
│   ├── components/
│   │   ├── Editor/           # 编辑区（CodeMirror 6）
│   │   ├── Preview/          # 预览区（react-markdown 渲染）
│   │   │   └── MermaidRenderer.tsx  # Mermaid 图表渲染
│   │   ├── Toolbar/          # 顶部工具栏
│   │   ├── StatusBar/        # 底部状态栏
│   │   ├── TOC/              # 目录大纲侧边栏
│   │   └── ui/               # shadcn/ui 通用组件
│   ├── hooks/
│   │   ├── useAutoSave.ts    # 自动保存 / 恢复
│   │   ├── useSyncScroll.ts  # 编辑器与预览区同步滚动
│   │   └── useTheme.ts       # 主题切换
│   ├── lib/
│   │   ├── markdown.ts       # 标题提取（目录大纲）
│   │   ├── export.tsx        # 导出独立 HTML
│   │   └── utils.ts          # 工具函数
│   └── styles/               # 全局样式
├── src-tauri/                # 后端（Rust）
│   ├── src/
│   │   ├── main.rs           # 程序入口
│   │   ├── lib.rs            # 插件注册与命令挂载
│   │   └── commands.rs       # 文件读写 / 对话框 / 自动保存命令
│   ├── capabilities/         # 权限配置
│   └── tauri.conf.json       # Tauri 配置（窗口、打包）
├── package.json              # 前端依赖与脚本
├── vite.config.ts            # Vite 配置
└── tailwind.config.js        # Tailwind 配置
```

---

## 🏗️ 架构说明

应用采用 **Tauri 前后端分离**架构：

- **前端（`src/`）**：负责全部界面与交互。所有组件的状态集中在 `src/store/editorStore.ts`（Zustand 单一 Store），界面零件只负责展示与触发动作。
- **后端（`src-tauri/`）**：负责与操作系统交互。文件对话框、文件读写、自动保存等能力由 `src-tauri/src/commands.rs` 中的 Tauri 命令提供，前端通过 `invoke()` 调用。

```
界面组件 (components)
      │  读取 / 触发
      ▼
Zustand Store (editorStore.ts) ──invoke()──► Rust 命令 (commands.rs) ──► 文件系统
      ▲
      └──────────── 自动保存 (useAutoSave.ts)
```

---

## 📸 截图

<!-- 在此处插入应用界面截图，例如：
![主界面](docs/screenshot-main.png)
![暗色模式](docs/screenshot-dark.png)
-->

（截图待补充）

---

## ❓ 常见问题

**Q：Windows 上启动报错缺少 WebView2？**
A：安装 [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)（Windows 11 通常已内置）。

**Q：`pnpm tauri dev` 编译很慢或失败？**
A：首次编译 Rust 需要下载并编译依赖，耗时较长属正常。失败时检查是否安装了 MSVC Build Tools（Windows）或 Xcode CLT（macOS）。

**Q：导出的 HTML 打开后样式错乱？**
A：导出的 HTML 已内联全部样式，请使用较新的浏览器打开；Mermaid 图表依赖运行时渲染，导出文档中以代码块形式保留。

---

## 📄 许可证

本项目目前**未指定开源许可证**，保留所有权利。如需开源发布，请补充 LICENSE 文件（如 MIT、Apache-2.0）。

---

<div align="center">

**DevDoc Markdown Editor** · Made with ❤️

</div>
