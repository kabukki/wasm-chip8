use serde::Serialize;
use crate::{
    debug::Probe,
    memory::{Memory, MEMORY_SIZE},
    cpu::instruction::Instruction,
};

#[derive(Serialize)]
pub struct MemoryDebug {
    ram: Vec<u8>,
    disassembly: Vec<(u16, Instruction)>,
}

impl Probe<MemoryDebug> for Memory {
    fn get_debug (&self) -> MemoryDebug {
        MemoryDebug {
            ram: self.ram.to_vec(),
            disassembly: (0 .. MEMORY_SIZE).step_by(2).map(|n| (n as u16, self.fetch(n))).collect()
        }
    }
}
