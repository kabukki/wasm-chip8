use wasm_bindgen::prelude::*;
use crate::{
    debug::Probe,
    cpu::Cpu,
};

#[wasm_bindgen]
#[derive(Clone)]
pub struct CpuDebug {
    v: [u8; 16],
    i: u16,
    pc: u16,
    stack: [u16; 16],
    sp: usize,
    dt: u8,
    st: u8,
}

#[wasm_bindgen]
impl CpuDebug {
    #[wasm_bindgen(getter)]
    pub fn v (&self) -> Vec<u8> {
        self.v.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn i (&self) -> u16 {
        self.i
    }

    #[wasm_bindgen(getter)]
    pub fn pc (&self) -> u16 {
        self.pc
    }

    #[wasm_bindgen(getter)]
    pub fn stack (&self) -> Vec<u16> {
        self.stack.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn sp (&self) -> usize {
        self.sp
    }

    #[wasm_bindgen(getter)]
    pub fn dt (&self) -> u8 {
        self.dt
    }

    #[wasm_bindgen(getter)]
    pub fn st (&self) -> u8 {
        self.st
    }
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
