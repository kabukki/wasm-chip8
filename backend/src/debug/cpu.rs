use wasm_bindgen::prelude::*;
use crate::Emulator;

#[wasm_bindgen]
impl Emulator {
    pub fn debug_cpu_pc (&mut self) -> u16 {
        self.cpu.pc
    }
    
    pub fn debug_cpu_sp (&mut self) -> usize {
        self.cpu.sp
    }

    pub fn debug_cpu_v (&mut self) -> Vec<u8> {
        self.cpu.v.to_vec()
    }

    pub fn debug_cpu_i (&mut self) -> u16 {
        self.cpu.i
    }

    pub fn debug_cpu_stack (&mut self) -> Vec<u16> {
        self.cpu.stack.to_vec()
    }

    pub fn debug_cpu_dt (&mut self) -> u8 {
        self.cpu.dt
    }

    pub fn debug_cpu_st (&mut self) -> u8 {
        self.cpu.st
    }

    pub fn debug_cpu_clock (&mut self) -> JsValue {
        JsValue::from_serde(&self.cpu.clock).unwrap()
    }

    pub fn debug_cpu_clock_timer (&mut self) -> JsValue {
        JsValue::from_serde(&self.cpu.clock_timer).unwrap()
    }
}
