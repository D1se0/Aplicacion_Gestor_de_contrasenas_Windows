#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::process::Command;

fn main() {
  tauri::Builder::default()

    // 📝 LOGS A FICHERO (AppData/…/logs/app.log)
    .plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Debug)
        .build()
    )

    // 🌐 HTTP (necesario para tauriFetch)
    .plugin(tauri_plugin_http::init())

    .setup(|app| {
      log::info!("=== TAURI APP STARTED ===");

      // 📦 Carpeta real donde Tauri coloca los resources
      let resource_dir = app.path().resource_dir().unwrap();
      log::info!("Resource dir: {:?}", resource_dir);

      // 📍 Ruta al backend
      let backend_path = resource_dir
        .join("backend")
        .join("dist")
        .join("index.mjs");

      log::info!("Backend path: {:?}", backend_path);

      // 🚀 Lanzar backend con Node
      match Command::new("node")
        .arg(&backend_path)
        .spawn()
      {
        Ok(_) => {
          log::info!("Backend launched successfully");
        }
        Err(e) => {
          log::error!("Failed to launch backend: {:?}", e);
        }
      }

      Ok(())
    })

    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
