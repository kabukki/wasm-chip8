use wasm_bindgen::prelude::*;
use crate::{
    display::Display,
    memory::Memory,
    cpu::Cpu,
    input::Keypad,
    clock::Clock,
};

#[wasm_bindgen]
pub struct Emulator {
    pub (crate) cpu: Cpu,
    pub (crate) memory: Memory,
    pub (crate) display: Display,
    pub (crate) keypad: Keypad,
    pub (crate) clock: Clock,
}

#[wasm_bindgen]
impl Emulator {
    pub fn new (rom: &[u8]) -> Self {
        Self {
            cpu: Cpu::new(),
            memory: Memory::new(rom),
            display: Display::new(),
            keypad: Keypad::new(),
            clock: Clock::new(crate::clock::CLOCK_CPU),
        }
    }

    pub fn cycle (&mut self) {
        self.cpu.tick(
            self.clock.time,
            &mut self.memory,
            &mut self.display,
            &self.keypad,
        );

        self.clock.tick();
    }

    pub fn cycle_until_timer (&mut self) {
        let cycle = self.cpu.clock_timer.cycles;
        
        while cycle == self.cpu.clock_timer.cycles {
            self.cycle();
        }
    }

    pub fn cycle_until_cpu (&mut self) {
        let cycle = self.cpu.clock.cycles;
        
        while cycle == self.cpu.clock.cycles {
            self.cycle();
        }
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
}
