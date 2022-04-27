use serde::Serialize;
use crate::{
    debug::Probe,
    memory::{Memory, MEMORY_SIZE},
    cpu::disassembly::Disassembly,
};

#[derive(Serialize)]
pub struct MemoryDebug {
    ram: Vec<u8>,
    disassembly: Vec<Disassembly>,
}

impl Probe<MemoryDebug> for Memory {
    fn get_debug (&self) -> MemoryDebug {
        MemoryDebug {
            ram: self.ram.to_vec(),
            disassembly: (0 .. MEMORY_SIZE).step_by(2).map(|n| Disassembly::new(&self.fetch(n), n as u16)).collect()
        }
    }
}
