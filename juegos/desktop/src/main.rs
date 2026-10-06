#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{sync::mpsc, thread, time::Duration};
use tauri::{AppHandle, State, WebviewWindow};

const TEST_APP: u32 = 480;

struct Steam(Option<steamworks::Client>);

fn steam() -> Option<steamworks::Client> {
    let app = option_env!("STEAM_APP_ID").and_then(|id| id.parse().ok()).unwrap_or(TEST_APP);
    let (send, receive) = mpsc::channel();
    thread::spawn(move || match steamworks::Client::init_app(app) {
        Ok(client) => {
            let _ = send.send(Some(client.clone()));
            loop {
                client.run_callbacks();
                thread::sleep(Duration::from_millis(100));
            }
        }
        Err(_) => { let _ = send.send(None); }
    });
    receive.recv().ok().flatten()
}

#[tauri::command]
fn unlock(name: String, steam: State<Steam>) -> bool {
    let Some(client) = &steam.0 else { return false };
    let stats = client.user_stats();
    stats.achievement(&name).set().is_ok() && stats.store_stats().is_ok()
}

#[tauri::command]
fn fullscreen(window: WebviewWindow) {
    let on = window.is_fullscreen().unwrap_or(false);
    let _ = window.set_fullscreen(!on);
}

#[tauri::command]
fn quit(app: AppHandle) {
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        .manage(Steam(steam()))
        .invoke_handler(tauri::generate_handler![unlock, fullscreen, quit])
        .run(tauri::generate_context!())
        .expect("the game window could not open");
}