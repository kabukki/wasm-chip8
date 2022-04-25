use wasm_bindgen::prelude::*;
use serde::Serialize;
use crate::{
    debug::Probe,
    display::Display,
    memory::{Memory, debug::MemoryDebug},
    cpu::{Cpu, debug::CpuDebug},
    keypad::{Keypad, debug::KeypadDebug},
    clock::Clock,
};

#[wasm_bindgen]
pub struct Emulator {
    cpu: Cpu,
    memory: Memory,
    display: Display,
    keypad: Keypad,
    clock: Clock,
}

#[wasm_bindgen]
impl Emulator {
    pub fn new (rom: &[u8]) -> Self {
        let mut emulator = Self {
            cpu: Cpu::new(),
            memory: Memory::new(),
            display: Display::new(),
            keypad: Keypad::new(),
            clock: Clock::new(crate::clock::CLOCK_CPU),
        };

        emulator.memory.load(rom);

        emulator
    }

    pub fn cycle (&mut self) {
        self.cpu.tick(
            self.clock.time,
            &mut self.memory,
            &mut self.display,
            &mut self.keypad,
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

    /**
     * Not implemented through Probe trait because impls are not yet supported by wasm-bindgen.
     * https://github.com/rustwasm/wasm-bindgen/issues/2073
     */
    pub fn get_debug (&self) -> JsValue {
        JsValue::from_serde(&Debug {
            time: (self.clock.time * 1000.0) as usize,
            cpu: self.cpu.get_debug(),
            keypad: self.keypad.get_debug(),
            memory: self.memory.get_debug(),
        }).unwrap()
    }
}

#[derive(Serialize)]
pub struct Debug {
    time: usize,
    cpu: CpuDebug,
    keypad: KeypadDebug,
    memory: MemoryDebug,
}
