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
    sp: u8,

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
        if (self.dt > 0) {
            self.dt -= 1;
        }

        if (self.st > 0) {
            self.st -= 1;
            if (self.st == 0) {
                // Beep
            }
        }

        let instruction = Instruction::new(
            (self.memory[self.pc as usize] as u16) << 8 |(self.memory[self.pc as usize + 1] as u16)
        );

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
            (0, 0, 0xE, 0) => {
                // display.clear();
                self.pc += 2;
            },
            (0x2, ..) => {
                self.sp += 1;
                self.stack[self.sp as usize] = self.pc;
                self.pc = instruction.addr;
            },
            (0x1, ..) => {
                self.pc = instruction.addr;     
            },
            (0x4, ..) => {
                if (self.v[instruction.x as usize] != instruction.byte) {
                    self.pc += 2;
                }
            },
            (0x6, ..) => {
                self.v[instruction.x as usize] = instruction.byte;
                self.pc += 2;
            },
            (0x8, .., 0) => {
                self.v[instruction.x as usize] = self.v[instruction.y as usize];
                self.pc += 2;
            },
            (0xA, ..) => {
                self.i = instruction.addr;   
                self.pc += 2;
            },
            (0xC, ..) => {
                self.v[instruction.x as usize] = self.rand.gen_range(0..255) & instruction.byte;
                self.pc += 2;
            },
            (0xF, _, 0x6, 0x5) => {
                for n in 0..instruction.x {
                    self.v[n as usize] = self.memory[self.i as usize + n as usize];
                }
                self.pc += 2;
            },
            (..) => (),
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
    pub addr: u16,

    /**
     * A 4-bit value, the lower 4 bits of the high byte of the instruction
     */
    pub x: u8,

    /**
     * A 4-bit value, the upper 4 bits of the low byte of the instruction
     */
    pub y: u8,

    /**
     * A 4-bit value, the lowest 4 bits of the instruction
     */
    pub nibble: u8,

    /**
     * An 8-bit value, the lowest 8 bits of the instruction
     */
    pub byte: u8,
}

/**
 * Variables typology: x, y, addr, nibble, byte
 * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#3.0
 */
#[wasm_bindgen]
impl Instruction {
    pub fn new (opcode: u16) -> Self {
        return Instruction {
            opcode,
            addr: opcode & 0x0FFF,
            x: ((opcode & 0x0F00) >> 8) as u8,
            y: ((opcode & 0x00F0) >> 4) as u8,
            nibble: (opcode & 0x000F) as u8,
            byte: (opcode & 0x00FF) as u8,
        };
    }
}
