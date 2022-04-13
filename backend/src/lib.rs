use wasm_bindgen::prelude::*;

pub mod debug;
pub mod cpu;
pub mod memory;
pub mod display;
pub mod keypad;
pub mod chip8;

#[wasm_bindgen]
pub fn set_panic_hook () {
    console_error_panic_hook::set_once();
}
