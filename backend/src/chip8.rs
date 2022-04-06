use wasm_bindgen::prelude::*;
use crate::{
    display::Display,
    memory::Memory,
    cpu::{Cpu, debug::CpuDebug},
    keypad::{Keypad, debug::KeypadDebug},
    debug::Probe,
};

#[wasm_bindgen]
pub struct Chip8 {
    cpu: Cpu,
    memory: Memory,
    display: Display,
    keypad: Keypad,
}

#[wasm_bindgen]
impl Chip8 {
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

    pub fn get_debug (&self) -> Chip8Debug {
        Chip8Debug {
            cpu: self.cpu.get_debug(),
            keypad: self.keypad.get_debug(),
        }
    }
}

#[wasm_bindgen]
pub struct Chip8Debug {
    cpu: CpuDebug,
    keypad: KeypadDebug,
}

#[wasm_bindgen]
impl Chip8Debug {
    #[wasm_bindgen(getter)]
    pub fn cpu (&self) -> CpuDebug {
        self.cpu.to_owned()
    }

    #[wasm_bindgen(getter)]
    pub fn keypad (&self) -> KeypadDebug {
        self.keypad.to_owned()
    }
}
