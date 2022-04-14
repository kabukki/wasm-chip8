use serde::Serialize;
use crate::{
    cpu::instruction::Instruction,
};

#[derive(Serialize)]
pub struct Disassembly {
    address: u16,
    opcode: String,
    string: String,
}

impl Disassembly {
    pub fn new (instruction: Instruction, address: u16) -> Self {
        let nibbles = (
            (instruction.opcode & 0xF000) >> 12,
            (instruction.opcode & 0x0F00) >> 8,
            (instruction.opcode & 0x00F0) >> 4,
            (instruction.opcode & 0x000F),
        );

        Self {
            address,
            opcode: format!("{:04X}", instruction.opcode),
            string: match nibbles {
                (0, 0, 0xE, 0)      => format!("CLS"),
                (0, 0, 0xE, 0xE)    => format!("RET"),
                (0x1, _, _, _)      => format!("JMP {:03X}", instruction.nnn),
                (0x2, _, _, _)      => format!("CALL {:03X}", instruction.nnn),
                (0x3, _, _, _)      => format!("SE V{:X}, {:02X}", instruction.x, instruction.nn),
                (0x4, _, _, _)      => format!("SNE V{:X}, {:02X}", instruction.x, instruction.nn),
                (0x5, _, _, 0)      => format!("SE V{:X}, V{:X}", instruction.x, instruction.y),
                (0x6, _, _, _)      => format!("LD V{:X}, {:02X}", instruction.x, instruction.nn),
                (0x7, _, _, _)      => format!("ADD V{:X}, {:02X}", instruction.x, instruction.nn),
                (0x8, _, _, 0)      => format!("LD V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x1)    => format!("OR V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x2)    => format!("AND V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x3)    => format!("XOR V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x4)    => format!("ADD V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x5)    => format!("SUB V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x6)    => format!("SHR V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0x7)    => format!("SUBN V{:X}, V{:X}", instruction.x, instruction.y),
                (0x8, _, _, 0xE)    => format!("SHL V{:X}, V{:X}", instruction.x, instruction.y),
                (0x9, _, _, 0)      => format!("SNE V{:X}, V{:X}", instruction.x, instruction.y),
                (0xA, _, _, _)      => format!("LD I, {:03X}", instruction.nnn),
                (0xB, _, _, _)      => format!("JMP V0, {:03X}", instruction.nnn),
                (0xC, _, _, _)      => format!("RND V{:X}, {:02X}", instruction.x, instruction.nn),
                (0xD, _, _, _)      => format!("DRW V{:X}, V{:X}, {:X}", instruction.x, instruction.y, instruction.n),
                (0xE, _, 0x9, 0xE)  => format!("SKP V{:X}", instruction.x),
                (0xE, _, 0xA, 0x1)  => format!("SKNP V{:X}", instruction.x),
                (0xF, _, 0, 0x7)    => format!("LD V{:X}, DT", instruction.x),
                (0xF, _, 0, 0xA)    => format!("LD V{:X}, KEY", instruction.x),
                (0xF, _, 0x1, 0x5)  => format!("LD DT, V{:X}", instruction.x),
                (0xF, _, 0x1, 0x8)  => format!("LD ST, V{:X}", instruction.x),
                (0xF, _, 0x1, 0xE)  => format!("ADD I, V{:X}", instruction.x),
                (0xF, _, 0x2, 0x9)  => format!("LD I, FONT(V{:X})", instruction.x),
                (0xF, _, 0x3, 0x3)  => format!("BCD V{:X}", instruction.x),
                (0xF, _, 0x5, 0x5)  => format!("LD [I], V{:X}", instruction.x),
                (0xF, _, 0x6, 0x5)  => format!("LD V{:X}, [I]", instruction.x),
                (..)                => format!("???"),
            },
        }
    }
}
