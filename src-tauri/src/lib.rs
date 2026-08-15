mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::open_file_dialog,
            commands::save_file_dialog,
            commands::save_html_dialog,
            commands::save_file,
            commands::read_file,
            commands::save_autosave,
            commands::read_autosave,
            commands::clear_autosave,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
