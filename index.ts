import init, { Chip8, Instruction, set_panic_hook } from './pkg';

type Key = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

interface Options {
    clockSpeed: number;
    timerFrequency: number;
    refreshRate: number;
    onError?: (err: Error) => void;
    onCPU?: (opcode: number) => void;
    onTimer?: (shouldBeep: boolean) => void;
    onDisplay?: (Uint8Array) => void;
}

export class Emulator {
    private chip8: Chip8;
    private intervals: ReturnType<typeof setInterval>[];

    constructor (rom: Uint8Array) {
        this.chip8 = Chip8.new(rom);
        this.intervals = [];
    }

    get shouldBeep () {
        return this.chip8.beep();
    }

    start ({
        clockSpeed,
        timerFrequency,
        refreshRate,
        onError,
        onCPU,
        onTimer,
        onDisplay,
    }: Options) {
        this.intervals = [
            [this.cycleCPU.bind(this, onCPU), clockSpeed],
            [this.cycleTimers.bind(this, onTimer), timerFrequency],
            [this.cycleDisplay.bind(this, onDisplay), refreshRate],
        ].map(([fn, interval]) => {
            return setInterval(() => {
                try {
                    fn();
                } catch (err) {
                    onError?.(err);
                }
            }, interval);
        });
    }

    stop () {
        this.intervals.forEach(window.clearInterval);
    }

    keydown (key: Key) {
        this.chip8.set_key(key, true);
    }

    keyup (key: Key) {
        this.chip8.set_key(key, false);
    }

    cycleCPU (onCPU) {
        const instruction = this.chip8.step_cpu();
        onCPU?.(instruction.opcode);
    }

    cycleTimers (onTimer) {
        this.chip8.step_timers();
        onTimer?.(this.shouldBeep);
    }

    cycleDisplay (onDisplay) {
        onDisplay?.(this.chip8.get_framebuffer());
    }
}

export default async function () {
    return init().then(set_panic_hook);
}
