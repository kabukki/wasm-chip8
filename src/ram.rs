pub const MEMORY_SIZE: usize = 4096;
pub static mut RAM: [u8; MEMORY_SIZE] = [0; MEMORY_SIZE];

pub const RESERVED_START: usize = 0;
pub const RESERVED_END: usize = 0x1FF;
pub const PROGRAM_START: usize = 0x200;
pub const PROGRAM_START_ETI: usize = 0x600;
pub const PROGRAM_END: usize = 0x4095;
