import { Emulator, Rom, VideoOnOff, AudioBeep } from '@kabukki/emukit';
import throttle from 'lodash.throttle';

import init, { Chip8 as VM, set_panic_hook } from './pkg';

export type Button = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

export interface Options {
    canvas: HTMLCanvasElement,
    rom: Rom,
    colors: {
        on: string;
        off: string;
    };
}

export class Chip8 extends Emulator <AudioBeep, VideoOnOff> {
    public static memory: WebAssembly.Memory;
    public readonly rom: Rom;
    private vm: any;
    private lastInstruction: string;

    constructor ({
        canvas,
        rom,
        colors,
    }: Options) {
        super(new VideoOnOff(canvas, colors), new AudioBeep());
        this.rom = rom;
        this.vm = VM.new(rom.buffer);
        this.cycleCPU = throttle(this.cycleCPU.bind(this), 1000 / 200);
    }

    static async init () {
        if (!Chip8.memory) {
            const wasm = await init();

            set_panic_hook();

            Chip8.memory = wasm.memory;
        }
    }

    get shouldBeep () {
        return this.vm.beep();
    }

    loadSave () {}

    input (key: Button, state: boolean) {
        this.vm.update_key(key, state);
    }

    cycle () {
        this.cycleCPU();
        this.cycleTimers();
        this.video.framebuffer = this.vm.get_framebuffer();
        this.video.paint();
    }
    
    private cycleCPU () {
        this.lastInstruction = this.vm.cycle_cpu();
    }
    
    private cycleTimers () {
        this.vm.cycle_timers();

        if (this.shouldBeep) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    reset () {
        console.warn('Reset not implemented');
    }

    save () {
        return null;
    }

    debug () {
        const stats = this.stats.stats();

        return {
            performance: {
                fps: stats.fpsAverage,
                delta: stats.deltaAverage,
                frame: stats.frame,
                timestamp: stats.timestamp,
            },
            lastInstruction: this.lastInstruction,
        };
    }
}
