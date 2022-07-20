use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct Instruction {
    /**
     * Raw opcode
     */
    pub opcode: u16,

    /**
     * Opcode split into 4x4 bits
     */
    pub nibbles: (u8, u8, u8, u8),

    /**
     * A 12-bit value, the lowest 12 bits of the instruction
     */
    pub nnn: u16,
    
    /**
     * An 8-bit value, the lowest 8 bits of the instruction
     */
    pub nn: u8,

    /**
     * A 4-bit value, the lower 4 bits of the high byte of the instruction
     */
    pub x: usize,
    
    /**
     * A 4-bit value, the upper 4 bits of the low byte of the instruction
     */
    pub y: usize,

    /**
     * A 4-bit value, the lowest 4 bits of the instruction
     */
    pub n: u8,

    /**
     * Textual representation of the instruction
     */
    pub disassembly: String,
}

/**
 * Variables typology: x, y, n, nn, nnn
 * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#3.0
 */
impl Instruction {
    pub fn new (opcode: u16) -> Self {
        let nibbles = (
            ((opcode & 0xF000) >> 12) as u8,
            ((opcode & 0x0F00) >> 8) as u8,
            ((opcode & 0x00F0) >> 4) as u8,
            (opcode & 0x000F) as u8,
        );

        let nnn = ((nibbles.1 as u16) << 8) | ((nibbles.2 as u16) << 4) | (nibbles.3 as u16);
        let nn = (nibbles.2 << 4) | nibbles.3;
        let x = nibbles.1 as usize;
        let y = nibbles.2 as usize;
        let n = nibbles.3;

        Self {
            opcode,
            nibbles,
            nnn,
            nn,
            x,
            y,
            n,
            disassembly: match nibbles {
                (0, 0, 0xE, 0)      => format!("CLS"),
                (0, 0, 0xE, 0xE)    => format!("RET"),
                (0x1, _, _, _)      => format!("JMP {:03X}", nnn),
                (0x2, _, _, _)      => format!("CALL {:03X}", nnn),
                (0x3, _, _, _)      => format!("SE V{:X}, {:02X}", x, nn),
                (0x4, _, _, _)      => format!("SNE V{:X}, {:02X}", x, nn),
                (0x5, _, _, 0)      => format!("SE V{:X}, V{:X}", x, y),
                (0x6, _, _, _)      => format!("LD V{:X}, {:02X}", x, nn),
                (0x7, _, _, _)      => format!("ADD V{:X}, {:02X}", x, nn),
                (0x8, _, _, 0)      => format!("LD V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x1)    => format!("OR V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x2)    => format!("AND V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x3)    => format!("XOR V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x4)    => format!("ADD V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x5)    => format!("SUB V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x6)    => format!("SHR V{:X}, V{:X}", x, y),
                (0x8, _, _, 0x7)    => format!("SUBN V{:X}, V{:X}", x, y),
                (0x8, _, _, 0xE)    => format!("SHL V{:X}, V{:X}", x, y),
                (0x9, _, _, 0)      => format!("SNE V{:X}, V{:X}", x, y),
                (0xA, _, _, _)      => format!("LD I, {:03X}", nnn),
                (0xB, _, _, _)      => format!("JMP V0, {:03X}", nnn),
                (0xC, _, _, _)      => format!("RND V{:X}, {:02X}", x, nn),
                (0xD, _, _, _)      => format!("DRW V{:X}, V{:X}, {:X}", x, y, n),
                (0xE, _, 0x9, 0xE)  => format!("SKP V{:X}", x),
                (0xE, _, 0xA, 0x1)  => format!("SKNP V{:X}", x),
                (0xF, _, 0, 0x7)    => format!("LD V{:X}, DT", x),
                (0xF, _, 0, 0xA)    => format!("LD V{:X}, KEY", x),
                (0xF, _, 0x1, 0x5)  => format!("LD DT, V{:X}", x),
                (0xF, _, 0x1, 0x8)  => format!("LD ST, V{:X}", x),
                (0xF, _, 0x1, 0xE)  => format!("ADD I, V{:X}", x),
                (0xF, _, 0x2, 0x9)  => format!("LD I, FONT(V{:X})", x),
                (0xF, _, 0x3, 0x3)  => format!("BCD V{:X}", x),
                (0xF, _, 0x5, 0x5)  => format!("LD [I], V{:X}", x),
                (0xF, _, 0x6, 0x5)  => format!("LD V{:X}, [I]", x),
                (..)                => format!("???"),
            },
        }
    }
}

#[test]
fn nibbles () {
    let instruction = Instruction::new(0xABCD);

    assert_eq!(instruction.opcode,  0xABCD);
    assert_eq!(instruction.nnn,     0x0BCD);
    assert_eq!(instruction.nn,      0x00CD);
    assert_eq!(instruction.x,       0x000B);
    assert_eq!(instruction.y,       0x000C);
    assert_eq!(instruction.n,       0x000D);
}
