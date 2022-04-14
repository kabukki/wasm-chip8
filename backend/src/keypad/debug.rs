use serde::Serialize;
use crate::{
    debug::Probe,
    keypad::Keypad,
};

#[derive(Serialize)]
pub struct KeypadDebug {
    state: [bool; 16],
}

impl Probe<KeypadDebug> for Keypad {
    fn get_debug (&self) -> KeypadDebug {
        KeypadDebug {
            state: self.state,
        }
    }
}
