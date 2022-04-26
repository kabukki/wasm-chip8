use wasm_bindgen::prelude::*;

pub mod debug;
pub mod clock;
pub mod cpu;
pub mod memory;
pub mod display;
pub mod keypad;
pub mod emulator;
pub mod logger;

#[wasm_bindgen]
pub fn set_panic_hook () {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn set_logger (callback: js_sys::Function) {
    log::set_boxed_logger(Box::new(crate::logger::Logger::new(callback))).unwrap();
    log::set_max_level(log::LevelFilter::Trace);
}
