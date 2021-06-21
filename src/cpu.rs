use wasm_bindgen::prelude::*;

use crate::memory::{Memory, PROGRAM_START, RESERVED_START};
use crate::display::Display;
use crate::keypad::Keypad;
use rand::Rng;

pub const CLOCK_RATE: f32 = 1000.0 / 500.0; // 500 Hz
pub const TIMER_RATE: f32 = 1000.0 / 60.0; // 60 Hz

pub struct Cpu {
    /**
     * Registers
     */
    v: [u8; 16],

    /**
     * Address register
     */
    i: u16,

    /**
     * Program counter
     */
    pc: u16,

    /**
     * Stack containing program counters before jumping
     */
    stack: [u16; 16],

    /**
     * Stack pointer
     */
    sp: usize,

    /**
     * Delay timer
     */
    dt: u8,

    /**
     * Sound timer. The system’s buzzer sounds whenever the sound timer reaches zero
     */
    st: u8,

    /**
     * PRNG
     */
    rand: rand::rngs::ThreadRng,
}

impl Cpu {
    pub fn new () -> Cpu {
        return Cpu {
            v: [0; 16],
            i: 0,
            pc: PROGRAM_START as u16,
            stack: [0; 16],
            sp: 0,
            dt: 0,
            st: 0,
            rand: rand::thread_rng(),
        };
    }
    
    pub fn cycle_timers (&mut self) {
        if self.dt > 0 {
            self.dt -= 1;
        }
        
        if self.st > 0 {
            self.st -= 1;
        }
    }

    pub fn tick (&mut self, memory: &mut Memory, display: &mut Display, keypad: &Keypad) -> Instruction {
        let instruction = Instruction::new((memory.ram[self.pc as usize] as u16) << 8 | (memory.ram[self.pc as usize + 1] as u16));
        let nibbles = (
            (instruction.opcode & 0xF000) >> 12,
            (instruction.opcode & 0x0F00) >> 8,
            (instruction.opcode & 0x00F0) >> 4,
            (instruction.opcode & 0x000F),
        );
        
        self.pc += 2;

        match nibbles {
            (0, 0, 0xE, 0) => display.clear(),
            (0, 0, 0xE, 0xE) => {
                self.sp -= 1;
                self.pc = self.stack[self.sp];
            },
            (0, _, _, _) => (),
            (0x1, _, _, _) => self.pc = instruction.nnn,
            (0x2, _, _, _) => {
                self.stack[self.sp] = self.pc;
                self.sp += 1;
                self.pc = instruction.nnn;
            },
            (0x3, _, _, _) => self.pc += if self.v[instruction.x] == instruction.nn { 2 } else { 0 },
            (0x4, _, _, _) => self.pc += if self.v[instruction.x] != instruction.nn { 2 } else { 0 },
            (0x5, _, _, 0) => self.pc += if self.v[instruction.x] == self.v[instruction.y] { 2 } else { 0 },
            (0x6, _, _, _) => self.v[instruction.x] = instruction.nn,
            (0x7, _, _, _) => self.v[instruction.x] += instruction.nn,
            (0x8, _, _, 0) => self.v[instruction.x] = self.v[instruction.y],
            (0x8, _, _, 0x1) => self.v[instruction.x] = self.v[instruction.x] | self.v[instruction.y],
            (0x8, _, _, 0x2) => self.v[instruction.x] = self.v[instruction.x] & self.v[instruction.y],
            (0x8, _, _, 0x3) => self.v[instruction.x] = self.v[instruction.x] ^ self.v[instruction.y],
            (0x8, _, _, 0x4) => {
                let (res, overflow) = self.v[instruction.x].overflowing_add(self.v[instruction.y]);
                self.v[0xF] = if overflow { 1 } else { 0 };
                self.v[instruction.x] = res;
            },
            (0x8, _, _, 0x5) => {
                let (res, overflow) = self.v[instruction.x].overflowing_sub(self.v[instruction.y]);
                self.v[0xF] = if overflow { 0 } else { 1 };
                self.v[instruction.x] = res;
            },
            (0x8, _, _, 0x6) => {
                self.v[0xF] = if (self.v[instruction.x] & 1) == 1 { 1 } else { 0 };
                self.v[instruction.x] /= 2;
            },
            (0x8, _, _, 0x7) => {
                let (res, overflow) = self.v[instruction.y].overflowing_sub(self.v[instruction.x]);
                self.v[0xF] = if overflow { 0 } else { 1 };
                self.v[instruction.x] = res;
            },
            (0x8, _, _, 0xE) => {
                self.v[0xF] = if (self.v[instruction.x] >> 7) == 1 { 1 } else { 0 };
                self.v[instruction.x] *= 2;
            },
            (0x9, _, _, 0) => self.pc += if self.v[instruction.x] != self.v[instruction.y] { 2 } else { 0 },
            (0xA, _, _, _) => self.i = instruction.nnn,
            (0xB, _, _, _) => self.pc = instruction.nnn + self.v[0] as u16,
            (0xC, _, _, _) => self.v[instruction.x] = self.rand.gen_range(0..255) & instruction.nn,
            (0xD, _, _, _) => {
                let bytes = &memory.ram[self.i as usize .. self.i as usize + instruction.n as usize];
                let collision = display.draw_sprite(
                    self.v[instruction.x] as usize,
                    self.v[instruction.y] as usize,
                    bytes,
                );

                self.v[0xF] = if collision { 1 } else { 0 };
            },
            (0xE, _, 0x9, 0xE) => self.pc += if keypad.keys[self.v[instruction.x] as usize] { 2 } else { 0 },
            (0xE, _, 0xA, 0x1) => self.pc += if keypad.keys[self.v[instruction.x] as usize] { 0 } else { 2 },
            (0xF, _, 0, 0x7) => self.v[instruction.x] = self.dt,
            (0xF, _, 0, 0xA) => {
                // Check for key press, or loop back
                let n = keypad.keys.iter().position(|&key| key == true);

                if n.is_none() {
                    self.pc -= 2;
                } else {
                    self.v[instruction.x] = n.unwrap() as u8;
                }
            },
            (0xF, _, 0x1, 0x5) => {
                self.dt = self.v[instruction.x];
            },
            (0xF, _, 0x1, 0x8) => {
                self.st = self.v[instruction.x];
            },
            (0xF, _, 0x1, 0xE) => {
                self.i += self.v[instruction.x] as u16;
            },
            (0xF, _, 0x2, 0x9) => {
                self.i = (RESERVED_START * 5 * self.v[instruction.x] as usize) as u16;
            },
            (0xF, _, 0x3, 0x3) => {
                memory.ram[self.i as usize] = self.v[instruction.x] / 100 % 10;
                memory.ram[self.i as usize + 1] = self.v[instruction.x] / 10 % 10;
                memory.ram[self.i as usize + 2] = self.v[instruction.x] % 10;
            },
            (0xF, _, 0x5, 0x5) => {
                for n in 0..instruction.x + 1 {
                    memory.ram[self.i as usize + n as usize] = self.v[n as usize];
                }
            },
            (0xF, _, 0x6, 0x5) => {
                for n in 0..instruction.x + 1 {
                    self.v[n as usize] = memory.ram[self.i as usize + n as usize];
                }
            },
            (..) => (),
        }

        return instruction;
    }

    pub fn beep (&self) -> bool {
        return self.st > 0;
    }
}

#[wasm_bindgen]
pub struct Instruction {
    /**
     * Raw opcode
     */
    pub opcode: u16,

    /**
     * A 12-bit value, the lowest 12 bits of the instruction
     */
    pub nnn: u16,
    
    /**
     * An 8-bit value, the lowest 8 bits of the instruction
     */
    pub nn: u8,

    /**
     * A 4-bit value, the lowest 4 bits of the instruction
     */
    pub n: u8,

    /**
     * A 4-bit value, the lower 4 bits of the high byte of the instruction
     */
    pub x: usize,

    /**
     * A 4-bit value, the upper 4 bits of the low byte of the instruction
     */
    pub y: usize,
}

/**
 * Variables typology: x, y, n, nn, nnn
 * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#3.0
 */
#[wasm_bindgen]
impl Instruction {
    pub fn new (opcode: u16) -> Self {
        return Instruction {
            opcode,
            nnn: opcode & 0x0FFF,
            nn: (opcode & 0x00FF) as u8,
            n: (opcode & 0x000F) as u8,
            x: ((opcode & 0x0F00) >> 8) as usize,
            y: ((opcode & 0x00F0) >> 4) as usize,
        };
    }
}
