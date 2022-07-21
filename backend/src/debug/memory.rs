use wasm_bindgen::prelude::*;
use crate::Emulator;

#[wasm_bindgen]
impl Emulator {
    pub fn debug_memory (&self) -> Vec<u8> {
        self.memory.ram.to_vec()
    }
}
