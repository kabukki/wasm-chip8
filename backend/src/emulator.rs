use wasm_bindgen::prelude::*;
use serde::Serialize;
use crate::{
    debug::Probe,
    display::Display,
    memory::{Memory, debug::MemoryDebug},
    cpu::{Cpu, debug::CpuDebug},
    keypad::{Keypad, debug::KeypadDebug},
};

#[wasm_bindgen]
pub struct Emulator {
    cpu: Cpu,
    memory: Memory,
    display: Display,
    keypad: Keypad,
}

#[wasm_bindgen]
impl Emulator {
    pub fn new (rom: &[u8]) -> Self {
        let mut emulator = Self {
            cpu: Cpu::new(),
            memory: Memory::new(),
            display: Display::new(),
            keypad: Keypad::new(),
        };

        emulator.memory.load(rom);

        emulator
    }

    pub fn cycle_cpu (&mut self) {
        self.cpu.tick(
            &mut self.memory,
            &mut self.display,
            &mut self.keypad,
        );
    }

    pub fn cycle_timers (&mut self) {
        self.cpu.cycle_timers();
    }

    pub fn beep (&self) -> bool {
        self.cpu.beep()
    }

    pub fn update_key (&mut self, key: usize, state: bool) {
        self.keypad.state[key] = state;
    }

    pub fn get_framebuffer (&self) -> Vec<u8> {
        self.display.framebuffer.iter().flat_map(|&pixel| if pixel { [255, 255, 255, 255] } else { [0, 0, 0, 255] }).collect()
    }

    /**
     * Not implemented through Probe trait because impls are not yet supported by wasm-bindgen.
     * https://github.com/rustwasm/wasm-bindgen/issues/2073
     */
    pub fn get_debug (&self) -> JsValue {
        JsValue::from_serde(&Debug {
            cpu: self.cpu.get_debug(),
            keypad: self.keypad.get_debug(),
            memory: self.memory.get_debug(),
        }).unwrap()
    }
}

#[derive(Serialize)]
pub struct Debug {
    cpu: CpuDebug,
    keypad: KeypadDebug,
    memory: MemoryDebug,
}
