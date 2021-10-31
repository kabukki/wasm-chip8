extern crate console_error_panic_hook;

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

    pub fn cycle_cpu (&mut self) -> Instruction {
        return self.cpu.tick(
            &mut self.memory,
            &mut self.display,
            &mut self.keypad,
        );
    }

    pub fn cycle_timers (&mut self) {
        self.cpu.cycle_timers();
    }

    pub fn beep (&self) -> bool {
        return self.cpu.beep();
    }

    pub fn update_key (&mut self, key: usize, state: bool) {
        self.keypad.state[key] = state;
    }

    pub fn get_framebuffer (&self) -> Vec<u8> {
        return self.display.framebuffer.iter().map(|&pixel| if pixel { 1 } else { 0 }).collect();
    }
}

#[wasm_bindgen]
pub fn set_panic_hook () {
    console_error_panic_hook::set_once();
}
