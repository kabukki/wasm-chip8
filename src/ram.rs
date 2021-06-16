pub static mut RAM: [u8; 4096] = [0; 4096];

pub const RESERVED_START: usize = 0;
pub const RESERVED_END: usize = 0x1FF;
pub const PROGRAM_START: usize = 0x200;
pub const PROGRAM_START_ETI: usize = 0x600;
pub const PROGRAM_END: usize = 0x4095;
