memory.grow(1);

// class CPU {
//     // Registers
//     v: i8[] = new Array(16);
//     // Program counter
//     pc: u16 = 0;
//     // Stack origin
//     stack: i32[] = new Array(16);
//     // Stack pointer
//     sp: i32;
// };

export const map = new Uint8Array(32 * 32 * 4);
export let mapOffset: u32 = 0;

export function tick (): void {
    map[mapOffset + 0] = (mapOffset % 8 === 0) ? 0x00 : 0xFF;
    map[mapOffset + 1] = (mapOffset % 8 === 0) ? 0x00 : 0xFF;
    map[mapOffset + 2] = (mapOffset % 8 === 0) ? 0x00 : 0xFF;
    map[mapOffset + 3] = 0xFF;
    mapOffset = (mapOffset + 4) % map.length;
}

// export function main (): void {
//   const cpu = new CPU();

//   while (cpu.pc < 4096) {
//     // const opcode: u16 = rom[cpu.pc];
//     // map[mapOffset++] = opcode;
//     cpu.pc++;
//   }
// }
