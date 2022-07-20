use wasm_bindgen::prelude::*;
use crate::Emulator;

#[wasm_bindgen]
impl Emulator {
    pub fn debug_memory_ram (&self) -> Vec<u8> {
        self.memory.ram.to_vec()
    }
}
