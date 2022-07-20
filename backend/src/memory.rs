use crate::{display, cpu::Instruction};

pub const MEMORY_SIZE: usize = 4096;
pub const RESERVED_START: usize = 0;
pub const PROGRAM_START: usize = 0x200;
pub const PROGRAM_START_ETI: usize = 0x600;

pub struct Memory {
    pub ram: [u8; MEMORY_SIZE],
}

impl Memory {
    pub fn new (rom: &[u8]) -> Memory {
        let mut ram = [0; MEMORY_SIZE];

        // Store font sprites
        ram[RESERVED_START .. RESERVED_START + display::FONT_SET.len()].copy_from_slice(&display::FONT_SET);
        ram[PROGRAM_START .. PROGRAM_START + rom.len()].copy_from_slice(rom);

        Memory {
            ram,
        }
    }

    pub fn fetch (&self, at: u16) -> Instruction {
        Instruction::new((self.ram[at as usize] as u16) << 8 | (self.ram[at as usize + 1] as u16))
    }
}
