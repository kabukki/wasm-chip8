import { display } from './display';
import { ram } from './ram';

class CPU {
    // Registers
    v: u8[] = new Array(16);
    // Address register
    i: u16 = 0;
    // Program counter
    pc: u16 = 0x200;
    // Stack containing program counters before jumping
    stack: u16[] = new Array(16);
    // Stack pointer
    sp: u8;

    // Timers counting down @ 60Hz
    delayTimer: u8 = 0;
    soundTimer: u8 = 0; // The system’s buzzer sounds whenever the sound timer reaches zero

    get currentInstruction (): u16 {
        return (ram[this.pc] as u16) << 8 | ram[this.pc + 1];
    }

    ldi (instruction: u16): void {
        const address = instruction & 0x0FFF;
        this.i = address;
    }
    
    cls (): void {
        display.clear();
    }

    // drw (instruction: u16) {
    //     const x = (instruction & 0x0F00) >> 8;
    //     const y = (instruction & 0x00F0) >> 8;
    //     const n = instruction & 0x000F;
    //     display.draw(x, y, n);
    // }

    /**
     * Cycle
     */
    cycle (): void {
        if (this.delayTimer > 0) {
            this.delayTimer--;
        }

        if (this.soundTimer > 0) {
            this.soundTimer--;
            if (this.soundTimer === 0) {
                // Beep
            }
        }

        // this.ldi(this.currentInstruction);
        this.pc += 2;
    }
};

export const cpu = new CPU();
