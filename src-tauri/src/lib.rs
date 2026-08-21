mod commands;

use std::sync::Mutex;

use tauri::{Emitter, Manager};

/// 应用启动时通过命令行参数传入的文件路径（例如用户从资源管理器双击 .md 文件）。
/// 前端通过 `get_startup_file` 命令读取并清空。
static STARTUP_FILE: Mutex<Option<String>> = Mutex::new(None);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 启动时检查命令行参数，提取文件路径
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        let path = &args[1];
        if std::path::Path::new(path).exists() {
            if let Ok(mut sf) = STARTUP_FILE.lock() {
                *sf = Some(path.clone());
            }
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            // 当第二个实例启动时（例如从资源管理器双击 .md 文件），
            // 聚焦已有窗口并将文件路径发送给前端。
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
                if args.len() > 1 {
                    let path = &args[1];
                    if std::path::Path::new(path).exists() {
                        let _ = window.emit("open-file", path);
                    }
                }
            }
        }))
        .setup(|app| {
            // 如果启动时带有文件参数，窗口创建后发送给前端
            if let Ok(sf) = STARTUP_FILE.lock() {
                if let Some(path) = sf.clone() {
                    if app.get_webview_window("main").is_some() {
                        // 延迟一小段时间，确保前端 JS 已加载并设置了事件监听
                        let handle = app.handle().clone();
                        let path_clone = path.clone();
                        std::thread::spawn(move || {
                            std::thread::sleep(std::time::Duration::from_millis(500));
                            if let Some(win) = handle.get_webview_window("main") {
                                let _ = win.emit("open-file", &path_clone);
                            }
                        });
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_file_dialog,
            commands::save_file_dialog,
            commands::save_html_dialog,
            commands::save_file,
            commands::read_file,
            commands::save_autosave,
            commands::read_autosave,
            commands::clear_autosave,
            commands::get_startup_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
