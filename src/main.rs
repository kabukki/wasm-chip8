use std::{
    io::prelude::*,
    fs::File,
};
use chip8::cpu::Cpu;
use chip8::ram;

fn main () {
    let mut cpu = Cpu::new();
    let file = File::open("roms/stars.ch8").expect("Oops");

    for (n, byte) in file.bytes().enumerate() {
        cpu.memory[(n as usize) + ram::PROGRAM_START] = byte.unwrap();
    }

    cpu.cycle();
    cpu.cycle();
    cpu.cycle();
    cpu.cycle();
    cpu.cycle();
    cpu.cycle();
}
