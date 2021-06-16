import { ram } from './ram';
import { display } from './display';
import { cpu } from './cpu';

memory.grow(1);

export function tick (): void {
    cpu.cycle();
}

export function init (): void {
    ram.fill(0);
    // TODO load fontset
    cpu.reset();
}

export function draw (): void {
    display.draw(0, 0, true);
}

// Expose framebuffer for host to draw
export const framebuffer = display.framebuffer;
export { ram } from './ram';

export function currentInstruction (): u16 {
    return cpu.currentInstruction;
}

export function currentPC (): u16 {
    return cpu.pc;
}
