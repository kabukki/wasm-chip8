use js_sys::Math;
use crate::{
    memory::{Memory, PROGRAM_START, RESERVED_START},
    display::Display,
    input::Keypad,
    clock::ClockDivider,
    cpu::instruction::Instruction,
};

pub struct Cpu {
    pub v: [u8; 16],
    pub i: u16,
    pub pc: u16,
    pub stack: [u16; 16],
    pub sp: usize,
    pub dt: u8,
    pub st: u8,
    pub clock: ClockDivider,
    pub clock_timer: ClockDivider,
}

impl Cpu {
    pub fn new () -> Self {
        Self {
            v: [0; 16],
            i: 0,
            pc: PROGRAM_START as u16,
            stack: [0; 16],
            sp: 0,
            dt: 0,
            st: 0,
            clock: ClockDivider::new(crate::clock::CLOCK_CPU),
            clock_timer: ClockDivider::new(crate::clock::CLOCK_TIMER),
        }
    }
    
    pub fn tick (&mut self, time: f64, memory: &mut Memory, display: &mut Display, keypad: &Keypad) {
        if self.clock.tick(time) {
            self.cycle(memory, display, keypad);
        }

        if self.clock_timer.tick(time) {
            self.cycle_timers();
        }
    }

    pub fn cycle (&mut self, memory: &mut Memory, display: &mut Display, keypad: &Keypad) -> Instruction {
        let instruction = memory.fetch(self.pc);

        // Log state after fetch step
        self.log(&instruction);
        self.pc += 2;

        match instruction.nibbles {
            (0, 0, 0xE, 0) => display.clear(),
            (0, 0, 0xE, 0xE) => {
                self.sp -= 1;
                self.pc = self.stack[self.sp];
            },
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
            (0x7, _, _, _) => self.v[instruction.x] = self.v[instruction.x].wrapping_add(instruction.nn),
            (0x8, _, _, 0) => self.v[instruction.x] = self.v[instruction.y],
            (0x8, _, _, 0x1) => self.v[instruction.x] |= self.v[instruction.y],
            (0x8, _, _, 0x2) => self.v[instruction.x] &= self.v[instruction.y],
            (0x8, _, _, 0x3) => self.v[instruction.x] ^= self.v[instruction.y],
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
                self.v[instruction.x] = self.v[instruction.x].wrapping_div(2);
            },
            (0x8, _, _, 0x7) => {
                let (res, overflow) = self.v[instruction.y].overflowing_sub(self.v[instruction.x]);
                self.v[0xF] = if overflow { 0 } else { 1 };
                self.v[instruction.x] = res;
            },
            (0x8, _, _, 0xE) => {
                self.v[0xF] = if (self.v[instruction.x] >> 7) == 1 { 1 } else { 0 };
                self.v[instruction.x] = self.v[instruction.x].wrapping_mul(2);
            },
            (0x9, _, _, 0) => self.pc += if self.v[instruction.x] != self.v[instruction.y] { 2 } else { 0 },
            (0xA, _, _, _) => self.i = instruction.nnn,
            (0xB, _, _, _) => self.pc = instruction.nnn + self.v[0] as u16,
            (0xC, _, _, _) => self.v[instruction.x] = ((Math::random() * 255.0) as u8 + 1) & instruction.nn,
            (0xD, _, _, _) => {
                let bytes = &memory.ram[self.i as usize .. self.i as usize + instruction.n as usize];
                let collision = display.draw_sprite(
                    self.v[instruction.x] as usize,
                    self.v[instruction.y] as usize,
                    bytes,
                );

                self.v[0xF] = if collision { 1 } else { 0 };
            },
            (0xE, _, 0x9, 0xE) => self.pc += if keypad.state[self.v[instruction.x] as usize] { 2 } else { 0 },
            (0xE, _, 0xA, 0x1) => self.pc += if keypad.state[self.v[instruction.x] as usize] { 0 } else { 2 },
            (0xF, _, 0, 0x7) => self.v[instruction.x] = self.dt,
            (0xF, _, 0, 0xA) => {
                // Check for key press, or loop back
                let n = keypad.state.iter().position(|&key| key);

                if let Some(key) = n {
                    self.v[instruction.x] = key as u8;
                } else {
                    self.pc -= 2;
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
                self.i = (RESERVED_START + 5 * self.v[instruction.x] as usize) as u16;
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
            (..) => panic!("Unknown instruction {:02X}", instruction.opcode),
        }

        instruction
    }

    pub fn cycle_timers (&mut self) {
        if self.dt > 0 {
            self.dt -= 1;
        }
        
        if self.st > 0 {
            self.st -= 1;
        }
    }

    pub fn beep (&self) -> bool {
        self.st > 0
    }

    fn log (&self, instruction: &Instruction) {
        log::trace!(
            "{:04X} {:04X} {:16} {} I:{:03X} SP:{:02} DT:{:02} ST:{:02} CYC:{}",
            self.pc,
            instruction.opcode,
            instruction.disassembly,
            &self.v.iter().enumerate().map(|(n, v)| format!("V{:X}:{:02X}", n, v)).collect::<Vec<String>>().join(" "),
            self.i,
            self.sp,
            self.dt,
            self.st,
            self.clock.cycles,
        );
    }
}
