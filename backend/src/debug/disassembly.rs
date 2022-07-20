use wasm_bindgen::prelude::*;
use crate::{cpu, memory, Emulator};

#[derive(serde::Serialize)]
pub struct Disassembly {
    address: u16,
    opcode: u16,
    disassembly: String,
}

impl Disassembly {
    pub fn new (instruction: cpu::Instruction, address: u16) -> Self {
        Self {
            address,
            opcode: instruction.opcode,
            disassembly: instruction.disassembly,
        }
    }
}

#[wasm_bindgen]
impl Emulator {
    pub fn debug_disassembly_at (&mut self, address: u16) -> JsValue {
        let instruction = self.memory.fetch(address);
        let disassembly = Disassembly::new(instruction, address);

        JsValue::from_serde(&disassembly).unwrap()
    }

    pub fn debug_disassembly_index_to_address (&mut self, offset: u16) -> u16 {
        offset * 2
    }

    pub fn debug_disassembly_address_to_index (&mut self, address: u16) -> u16 {
        address / 2
    }

    pub fn debug_disassembly_total (&mut self) -> usize {
        memory::MEMORY_SIZE / 2
    }
}
