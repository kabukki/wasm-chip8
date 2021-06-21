use wasm_bindgen::prelude::*;
use crate::display::Display;
use crate::memory::Memory;
use crate::cpu::{Cpu, Instruction};
use crate::keypad::Keypad;

pub mod cpu;
pub mod memory;
pub mod display;
pub mod keypad;

#[wasm_bindgen]
pub struct Chip8 {
    cpu: Cpu,
    memory: Memory,
    display: Display,
    keypad: keypad::Keypad,
}

#[wasm_bindgen]
impl Chip8 {
    pub fn new (rom: &[u8]) -> Chip8 {
        let mut memory = Memory::new();

        memory.load_rom(rom);

        return Chip8 {
            cpu: Cpu::new(),
            memory,
            display: Display::new(),
            keypad: Keypad::new(),
        }
    }

    pub fn step_cpu (&mut self) -> Instruction {
        return self.cpu.tick(
            &mut self.memory,
            &mut self.display,
            &mut self.keypad,
        );
    }

    pub fn step_timers (&mut self) {
        self.cpu.cycle_timers();
    }

    pub fn set_key (&mut self, key: usize, pressed: bool) {
        self.keypad.keys[key] = pressed;
    }

    pub fn get_framebuffer (&self) -> *const bool {
        return self.display.framebuffer.as_ptr();
    }
}
