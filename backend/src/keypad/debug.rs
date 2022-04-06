use wasm_bindgen::prelude::*;
use crate::{
    debug::Probe,
    keypad::Keypad,
};

#[wasm_bindgen]
#[derive(Clone)]
pub struct KeypadDebug {
    state: [bool; 16],
}

#[wasm_bindgen]
impl KeypadDebug {
    #[wasm_bindgen(getter)]
    pub fn state (&self) -> Vec<u8> {
        self.state.iter().map(|&state| if state { 1 } else { 0 }).collect()
    }
}

impl Probe<KeypadDebug> for Keypad {
    fn get_debug (&self) -> KeypadDebug {
        KeypadDebug {
            state: self.state,
        }
    }
}
