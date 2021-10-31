import GameStats from 'game-stats';
import init, { Chip8, set_panic_hook } from './pkg';

type Key = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

interface Options {
    cpuFrequency: number;
    timerFrequency: number;
    colors: { on: string, off: string };
    onError?: (err: Error) => void;
    onCPU?: (opcode: number) => void;
    onTimer?: (shouldBeep: boolean) => void;
    onDebug?: (info: any) => void;
}

export interface Rom {
    name: string;
    buffer: Uint8Array;
    fingerprint: string;
}

export class Emulator {
    private vm: Chip8;
    private rafHandle: ReturnType<typeof requestAnimationFrame>;
    private cpuHandle: ReturnType<typeof setInterval>;
    private timerHandle: ReturnType<typeof setInterval>;
    private debugHandle: ReturnType<typeof setInterval>;
    private canvas: HTMLCanvasElement;
    private stats: GameStats;
    public rom: Rom;

    constructor (canvas: HTMLCanvasElement, rom: Rom) {
        this.vm = Chip8.new(rom.buffer);
        this.stats = new GameStats();
        this.canvas = canvas;
        this.rom = rom;
    }

    get shouldBeep () {
        return this.vm.beep();
    }

    start ({
        cpuFrequency,
        timerFrequency,
        colors,
        onError,
        onCPU,
        onTimer,
        onDebug,
    }: Options) {
        const context = this.canvas.getContext('2d');
        const rafCallback = (timestamp) => {
            try {
                const framebuffer = this.vm.get_framebuffer();

                for (let y = 0; y < this.canvas.height; y++) {
                    for (let x = 0; x < this.canvas.width; x++) {
                        context.fillStyle = framebuffer[x + y * this.canvas.width] === 1 ? colors.on : colors.off;
                        context.fillRect(x, y, 1, 1);
                    }
                }

                this.rafHandle = requestAnimationFrame(rafCallback);
                this.stats.record(timestamp);
            } catch (err) {
                onError?.(err);
                this.stop();
            }
        };

        this.cpuHandle = setInterval(() => {
            const instruction = this.vm.cycle_cpu();
            onCPU?.(instruction.opcode);
        }, cpuFrequency);
        this.timerHandle = setInterval(() => {
            this.vm.cycle_timers();
            onTimer?.(this.shouldBeep);
        }, timerFrequency);
        this.debugHandle = setInterval(() => {
            onDebug?.({
                stats: this.stats.stats(),
            });
        }, 1000);
        this.rafHandle = requestAnimationFrame(rafCallback);
    }

    stop () {
        clearInterval(this.cpuHandle);
        clearInterval(this.timerHandle);
        clearInterval(this.debugHandle);
        cancelAnimationFrame(this.rafHandle);
    }

    input (key: Key, state: boolean) {
        this.vm.update_key(key, state);
    }
}

export default async function () {
    return init().then(set_panic_hook);
}
