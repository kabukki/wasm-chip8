use serde::Serialize;

#[derive(Serialize)]
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
