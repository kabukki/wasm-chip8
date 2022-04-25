use serde::Serialize;
use crate::cpu::disassembly::Disassembly;

#[derive(Serialize, Clone)]
pub struct Log {
    pub cycles: usize,
    pub disassembly: Disassembly,
    pub pc: u16,
    pub sp: usize,
    pub dt: u8,
    pub st: u8,
    pub v: [u8; 16],
    pub i: u16,
}
