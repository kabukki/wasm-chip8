import GameStats from 'game-stats';

import wasm from '../backend/pkg/index_bg.wasm';
import init, { Emulator, set_panic_hook } from '../backend/pkg';
import { Debug } from './debug';
import { Logs } from './logs';
import { Audio } from './audio';

export type Button = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

export enum Status {
    IDLE,
    RUNNING,
    ERROR,
}

export class Chip8 {
    static VIDEO_WIDTH = 64;
    static VIDEO_HEIGHT = 32;
    
    canvas: HTMLCanvasElement;
    error: Error;
    logs: Logs;
    memory: WebAssembly.Memory;
    debug: Debug;
    audio: Audio;
    onCycle?: () => void;
    onStatus?: () => void;

    #vm: Emulator;
    #rafHandle: ReturnType<typeof requestAnimationFrame>;
    #stats: GameStats;

    static async new (rom) {
        const { memory } = await init(wasm);
        return new Chip8(rom, memory);
    }

    private constructor (rom, memory) {
        this.#vm = Emulator.new(rom);
        this.#stats = new GameStats({ historyLimit: 100 });
        this.logs = new Logs();
        this.memory = memory;
        this.audio = new Audio();

        set_panic_hook((message) => this.stop(new Error(message)));
    }

    start () {
        const rafCallback = (timestamp) => {
            this.cycleUntil('timer');
            this.#stats.record(timestamp);
            // Don't run another frame if it has been canceled in the mean time
            if (this.#rafHandle) {
                this.#rafHandle = requestAnimationFrame(rafCallback);
            }
        };

        this.#rafHandle = requestAnimationFrame(rafCallback);
        this.audio.start();
        this.onStatus?.();
    }

    stop (error?: Error) {
        this.audio.stop();
        cancelAnimationFrame(this.#rafHandle);
        this.#rafHandle = null;

        if (error && error instanceof Error) {
            console.error(error);
            this.error = error;
        }

        this.onStatus?.();
    }

    private cycle (fn) {
        try {
            fn();
            this.debug = new Debug(this.#vm);
            this.render();
            if (this.#vm.beep()) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        } catch (err) {
            // Don't call stop() here, because the original error will already be caught by the panic hook
            console.error(err);
        } finally {
            this.onCycle?.();
        }
    }

    cycleUntil (duration) {
        switch (duration) {
            case 'tick': this.cycle(this.#vm.cycle.bind(this.#vm)); break;
            case 'cpu': this.cycle(this.#vm.cycle_until_cpu.bind(this.#vm)); break;
            case 'timer': this.cycle(this.#vm.cycle_until_timer.bind(this.#vm)); break;
            default: console.warn('Unknown cycle duration');
        }
    }

    private render () {
        this.canvas?.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(this.#vm.get_framebuffer()), Chip8.VIDEO_WIDTH, Chip8.VIDEO_HEIGHT), 0, 0);
    }

    input (key, state) {
        this.#vm.update_key(key, state);
    }

    get status () {
        if (this.error) {
            return Status.ERROR;
        } else if (this.#rafHandle) {
            return Status.RUNNING;
        } else {
            return Status.IDLE;
        }
    }

    get performance () {
        return this.#stats.stats();
    }
}
