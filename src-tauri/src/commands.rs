//! Tauri 后端命令：文件对话框、文件读写、自动保存。
//!
//! 说明：Rust 侧使用 `std::fs` 直接读写文件（不受前端 fs scope 限制），
//! 对话框通过 `tauri-plugin-dialog` 的阻塞式 API 弹出。

use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;

/// 打开文件对话框，读取用户选择的文件内容。
/// 返回 `(path, content)`；用户取消时返回 `None`。
#[tauri::command]
pub fn open_file_dialog(app: AppHandle) -> Result<Option<(String, String)>, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown", "txt"])
        .blocking_pick_file();

    let Some(picked) = picked else {
        return Ok(None);
    };

    let path = picked.into_path().map_err(|e| e.to_string())?;
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(Some((path.to_string_lossy().to_string(), content)))
}

/// 弹出保存对话框，将内容写入用户选择的文件。
/// 返回保存路径；用户取消时返回 `None`。
#[tauri::command]
pub fn save_file_dialog(app: AppHandle, content: String) -> Result<Option<String>, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .set_file_name("untitled.md")
        .blocking_save_file();

    let Some(picked) = picked else {
        return Ok(None);
    };

    let path = picked.into_path().map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(Some(path.to_string_lossy().to_string()))
}

/// 弹出保存对话框（HTML 过滤器），将导出内容写入用户选择的文件。
/// 返回保存路径；用户取消时返回 `None`。
#[tauri::command]
pub fn save_html_dialog(app: AppHandle, content: String) -> Result<Option<String>, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("HTML", &["html"])
        .set_file_name("export.html")
        .blocking_save_file();

    let Some(picked) = picked else {
        return Ok(None);
    };

    let path = picked.into_path().map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(Some(path.to_string_lossy().to_string()))
}

/// 直接将内容写入指定路径。
#[tauri::command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

/// 读取指定路径的文件内容（UTF-8）。
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// 计算自动保存文件路径：`<app_data_dir>/autosave.md`。
fn autosave_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("autosave.md"))
}

/// 将当前内容写入自动保存文件。
#[tauri::command]
pub fn save_autosave(app: AppHandle, content: String) -> Result<(), String> {
    let path = autosave_path(&app)?;
    fs::write(path, content).map_err(|e| e.to_string())
}

/// 读取自动保存文件；不存在或为空时返回 `None`。
#[tauri::command]
pub fn read_autosave(app: AppHandle) -> Result<Option<String>, String> {
    let path = autosave_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    if content.trim().is_empty() {
        return Ok(None);
    }
    Ok(Some(content))
}

/// 清除自动保存文件（手动保存成功后调用）。
#[tauri::command]
pub fn clear_autosave(app: AppHandle) -> Result<(), String> {
    let path = autosave_path(&app)?;
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}
