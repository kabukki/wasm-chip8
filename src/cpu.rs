use crate::ram;
use rand::Rng;

pub struct Cpu {
    // Registers
    v: [u8; 16],
    // Address register
    i: u16,
    // Program counter
    pub pc: u16,
    // Stack containing program counters before jumping
    stack: [u16; 16],
    // Stack pointer
    sp: u8,
    // Delay timer
    dt: u8,
    // Sound timer. The system’s buzzer sounds whenever the sound timer reaches zero
    st: u8,
    pub memory: [u8; 4096],
    rand: rand::rngs::ThreadRng,
}

impl Cpu {
    pub fn new () -> Cpu {
        return Cpu {
            v: [0; 16],
            i: 0,
            pc: ram::PROGRAM_START as u16,
            stack: [0; 16],
            sp: 0,
            dt: 0,
            st: 0,
            memory: [0; 4096],
            rand: rand::thread_rng(),
        };
    }
    
    pub fn reset (&mut self) {
        self.v = [0; 16];
        self.i = 0;
        self.pc = 0x200;
        self.stack = [0; 16];
        self.sp = 0;
        self.dt = 0;
        self.st = 0;
    }

    pub fn cycle (&mut self) {
        if (self.dt > 0) {
            self.dt -= 1;
        }

        if (self.st > 0) {
            self.st -= 1;
            if (self.st == 0) {
                // Beep
            }
        }

        self.execute(
            Instruction::new(
                (self.memory[self.pc as usize] as u16) << 8 | (self.memory[self.pc as usize + 1] as u16)
            )
        );
    }

    pub fn execute (&mut self, instruction: Instruction) {
        print!("{:#0x} ", instruction.opcode);
        let nibbles = (
            (instruction.opcode & 0xF000) >> 12,
            (instruction.opcode & 0x0F00) >> 8,
            (instruction.opcode & 0x00F0) >> 4,
            (instruction.opcode & 0x000F),
        );

        match nibbles {
            // CLS
            (0, 0, 0xE, 0) => {
                println!("CLS");
                // display.clear();
                self.pc += 2;
            },
            // CALL
            (0x2, ..) => {
                println!("CALL {:#0x}", instruction.addr());
                self.sp += 1;
                self.stack[self.sp as usize] = self.pc;
                self.pc = instruction.addr();
            },
            // JP
            (0x1, ..) => {
                println!("JP {:#0x}", instruction.addr());
                self.pc = instruction.addr();     
            },
            // SNE
            (0x4, ..) => {
                println!("SNE");
                if (self.v[instruction.x() as usize] != instruction.byte()) {
                    self.pc += 2;
                }
            },
            // LD Vx, byte
            (0x6, ..) => {
                println!("LD V{}, {}", instruction.x(), instruction.byte());
                self.v[instruction.x() as usize] = instruction.byte();
                self.pc += 2;
            },
            // LD Vx Vy
            (0x8, .., 0) => {
                println!("LD V{}, V{}", instruction.x(), instruction.y());
                self.v[instruction.x() as usize] = self.v[instruction.y() as usize];
                self.pc += 2;
            },
            // LDI
            (0xA, ..) => {
                println!("LD I, {}", instruction.addr());
                self.i = instruction.addr();   
                self.pc += 2;
            },
            // RND Vx, byte
            (0xC, ..) => {
                println!("RND V{}, {}", instruction.x(), instruction.byte());
                self.v[instruction.x() as usize] = self.rand.gen_range(0..255) & instruction.byte();
                self.pc += 2;
            },
            // LD
            (0xF, _, 0x6, 0x5) => {
                println!("LD Vx [I]");
                for n in 0..instruction.x() {
                    self.v[n as usize] = self.memory[self.i as usize + n as usize];
                }
                self.pc += 2;
            },
            // Fallback
            (..) => {
                println!("UNKNOWN");
            },
        }
    }
}

pub struct Instruction {
    opcode: u16,
}

/**
 * Variables typology: x, y, addr, nibble, byte
 * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#3.0
 */
impl Instruction {
    pub fn new (opcode: u16) -> Self {
        return Instruction {
            opcode
        };
    }

    /**
     * A 12-bit value, the lowest 12 bits of the instruction
     */
    fn addr (&self) -> u16 {
        return self.opcode & 0x0FFF;
    }

    /**
     * A 4-bit value, the lowest 4 bits of the instruction
     */
    fn nibble (&self) -> u16 {
        return self.opcode & 0x000F;
    }

    /**
     * A 4-bit value, the lower 4 bits of the high byte of the instruction
     */
    fn x (&self) -> u8 {
        return ((self.opcode & 0x0F00) >> 8) as u8;
    }

    /**
     * A 4-bit value, the upper 4 bits of the low byte of the instruction
     */
    fn y (&self) -> u8 {
        return ((self.opcode & 0x00F0) >> 4) as u8;
    }

    /**
     * An 8-bit value, the lowest 8 bits of the instruction
     */
    fn byte (&self) -> u8 {
        return (self.opcode & 0x00FF) as u8;
    }
}
