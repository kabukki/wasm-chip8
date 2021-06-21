use crate::display;

pub const MEMORY_SIZE: usize = 4096;
pub const RESERVED_START: usize = 0;
pub const PROGRAM_START: usize = 0x200;
pub const PROGRAM_START_ETI: usize = 0x600;

pub struct Memory {
    pub ram: [u8; MEMORY_SIZE],
}

impl Memory {
    pub fn new () -> Memory {
        let mut ram = [0; MEMORY_SIZE];

        // Store font sprites
        ram[RESERVED_START .. RESERVED_START + display::FONT_SET.len()].copy_from_slice(&display::FONT_SET);

        return Memory {
            ram,
        };
    }

    pub fn load_rom (&mut self, rom: &[u8]) {
        self.ram[PROGRAM_START .. PROGRAM_START + rom.len()].copy_from_slice(&rom);
    }
}
