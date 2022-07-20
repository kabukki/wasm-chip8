use wasm_bindgen::prelude::*;
use crate::Emulator;

#[wasm_bindgen]
impl Emulator {
    pub fn debug_input (&self) -> JsValue {
        JsValue::from_serde(&self.keypad.state).unwrap()
    }
}
