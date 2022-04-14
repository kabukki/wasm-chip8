use serde::Serialize;
use crate::{
    debug::Probe,
    cpu::Cpu,
};

#[derive(Serialize)]
pub struct CpuDebug {
    v: [u8; 16],
    i: u16,
    pc: u16,
    stack: [u16; 16],
    sp: usize,
    dt: u8,
    st: u8,
}

impl Probe<CpuDebug> for Cpu {
    fn get_debug (&self) -> CpuDebug {
        CpuDebug {
            v: self.v,
            i: self.i,
            pc: self.pc,
            stack: self.stack,
            sp: self.sp,
            dt: self.dt,
            st: self.st,
        }
    }
}
