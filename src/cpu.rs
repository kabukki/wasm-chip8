use wasm_bindgen::prelude::*;

use crate::ram;
use crate::display;
use rand::Rng;

#[wasm_bindgen]
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
    pub pc: u16,

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

    memory: [u8; ram::MEMORY_SIZE],
    display: display::Display,
    rand: rand::rngs::ThreadRng,
}

#[wasm_bindgen]
impl Cpu {
    pub fn new (rom: &[u8]) -> Cpu {
        let mut memory = [0; ram::MEMORY_SIZE];

        // Store font sprites
        memory[ram::RESERVED_START .. ram::RESERVED_START + display::FONT_SET.len()].copy_from_slice(&display::FONT_SET);
        // Load ROM into memory
        memory[ram::PROGRAM_START .. ram::PROGRAM_START + rom.len()].copy_from_slice(&rom);

        return Cpu {
            v: [0; 16],
            i: 0,
            pc: ram::PROGRAM_START as u16,
            stack: [0; 16],
            sp: 0,
            dt: 0,
            st: 0,
            memory,
            display: display::Display::new(),
            rand: rand::thread_rng(),
        };
    }
    
    pub fn tick (&mut self) -> Instruction{
        if self.dt > 0 {
            self.dt -= 1;
        }

        if self.st > 0 {
            // Beep
            self.st -= 1;
        }

        let instruction = Instruction::new(
            (self.memory[self.pc as usize] as u16) << 8 | (self.memory[self.pc as usize + 1] as u16)
        );

        self.pc += 2;
        self.execute(&instruction);

        return instruction;
    }

    pub fn execute (&mut self, instruction: &Instruction) {
        let nibbles = (
            (instruction.opcode & 0xF000) >> 12,
            (instruction.opcode & 0x0F00) >> 8,
            (instruction.opcode & 0x00F0) >> 4,
            (instruction.opcode & 0x000F),
        );

        match nibbles {
            (0, 0, 0xE, 0) => self.display.clear(),
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
            (0x9, _, _, 0) => self.pc += if self.v[instruction.x] != self.v[instruction.y] { 2 } else { 0 },
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
            (0x8, _, _, 0xE) => {
                self.v[0xF] = if (self.v[instruction.x] >> 7) == 1 { 1 } else { 0 };
                self.v[instruction.x] *= 2;
            },
            (0xA, _, _, _) => self.i = instruction.nnn,
            (0xC, _, _, _) => self.v[instruction.x] = self.rand.gen_range(0..255) & instruction.nn,
            (0xD, _, _, _) => {
                let bytes = &self.memory[self.i as usize .. self.i as usize + instruction.n as usize];
                let collision = self.display.draw_sprite(
                    self.v[instruction.x] as usize,
                    self.v[instruction.y] as usize,
                    bytes,
                );

                self.v[0xF] = if collision { 1 } else { 0 };
            },
            (0xE, _, 0xA, 0x1) => {
                // Check for key press, or skip
                self.pc += 2;
            },
            (0xF, _, 0, 0x7) => {
                self.v[instruction.x] = self.dt;
            },
            (0xF, _, 0x1, 0x8) => {
                self.st = self.v[instruction.x];
            },
            (0xF, _, 0x1, 0xE) => {
                self.i += self.v[instruction.x] as u16;
            },
            (0xF, _, 0x9, 0xE) => {
                // Check for key press, and skip
            },
            (0xF, _, _, 0xA) => {
                // Check for key press, or loop back
                // Simulate '1' input
                self.v[instruction.x] = 1;
            },
            (0xF, _, 0x2, 0x9) => {
                self.i = (ram::RESERVED_START * 5 * self.v[instruction.x] as usize) as u16;
            },
            (0xF, _, 0x1, 0x5) => {
                self.dt = self.v[instruction.x];
            },
            (0xF, _, 0x3, 0x3) => {
                self.memory[self.i as usize] = self.v[instruction.x] / 100 % 10;
                self.memory[self.i as usize + 1] = self.v[instruction.x] / 10 % 10;
                self.memory[self.i as usize + 2] = self.v[instruction.x] % 10;
            },
            (0xF, _, 0x5, 0x5) => {
                for n in 0..instruction.x + 1 {
                    self.memory[self.i as usize + n as usize] = self.v[n as usize];
                }
            },
            (0xF, _, 0x6, 0x5) => {
                for n in 0..instruction.x + 1 {
                    self.v[n as usize] = self.memory[self.i as usize + n as usize];
                }
            },
            (..) => {
                self.pc -= 2; // Loop
            },
        }
    }

    /**
     * Returns a pointer to the display framebuffer
     */
    pub fn get_display (&self) -> *const bool {
        return self.display.framebuffer.as_ptr();
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
