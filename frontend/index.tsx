import React, { useRef, createContext, useEffect, useState, useCallback, useContext, MutableRefObject } from 'react';
import throttle from 'lodash.throttle';
import Statistics from 'game-stats/lib/interfaces/Statistics';

import initWasm, { Chip8, set_panic_hook } from '../backend/pkg';
import wasm from '../backend/pkg/index_bg.wasm';
import { useAudio, useAnimationFrame } from './hooks';

import picture from './assets/picture.png';
import content from './assets/content.png';

type Button = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

interface IDebug {
    performance: Statistics;
}

interface IEmulatorContext {
    canvas: MutableRefObject<HTMLCanvasElement>;
    error?: Error;
    audio: ReturnType<typeof useAudio>;
    debug: IDebug;
    input (key: Button, state: boolean): void;
    load (rom: Uint8Array): void;
    start (): void;
    stop (error?: Error): void;
    reset (): void;
}

export const EmulatorContext = createContext<IEmulatorContext>(null);

/**
 * Provides emulator with core functionality
 */
export const EmulatorProvider = ({ children }) => {
    const raf = useAnimationFrame();
    const audio = useAudio();
    const canvas = useRef<HTMLCanvasElement>();
    const [emulator, setEmulator] = useState<Chip8>(null);
    const [error, setError] = useState<Error>(null);
    const [debug, setDebug] = useState<IDebug>(null);

    const load = async (rom: Uint8Array) => {
        try {
            const emulator = Chip8.new(rom);
            setEmulator(emulator);
        } catch (err) {
            console.error(err);
            setError(err);
        }
    };

    const cycleCPU = useCallback(throttle(() => {
        emulator.cycle_cpu();
    }, 1000 / 200), [emulator]);

    const cycleTimers = useCallback(() => {
        emulator.cycle_timers();
    
        if (emulator.beep()) {
            audio.play();
        } else {
            audio.pause();
        }
    }, [emulator]);

    const paint = () => {
        if (canvas.current) {
            const context = canvas.current.getContext('2d');
            const framebuffer = emulator.get_framebuffer();
    
            for (let y = 0; y < context.canvas.height; y++) {
                for (let x = 0; x < context.canvas.width; x++) {
                    context.fillStyle = framebuffer[x + y * context.canvas.width] === 1 ? 'white' : 'black';
                    context.fillRect(x, y, 1, 1);
                }
            }
        } else {
            console.warn('Canvas ref is never used');
        }
    };

    const cycle = () => {
        try {
            cycleCPU();
            cycleTimers();
            paint();
            setDebug((previous) => ({
                ...previous,
                performance: raf.stats.stats(),
            }));
        } catch (err) {
            stop(err);
        }
    };

    const start = () => {
        raf.start(cycle);
        audio.start();
    };

    const stop = (error?: Error) => {
        audio.stop();
        raf.stop();
        if (error) {
            console.error(error);
            setError(error);
        }
    };

    const reset = () => {
        console.warn('Reset not implemented');
    };

    const input = (key: Button, state: boolean) => {
        emulator?.update_key(key, state);
    };

    // Auto-start emulator on load
    useEffect(() => {
        if (emulator) {
            start();
            return stop;
        }
    }, [emulator]);

    return (
        <EmulatorContext.Provider value={{
            canvas,
            error,
            audio,
            debug,
            load,
            start,
            stop,
            reset,
            input,
        }}>
            {children}
        </EmulatorContext.Provider>
    );
};

export const useLifecycle = () => {
    const { load, start, stop, reset } = useContext(EmulatorContext);

    return {
        load,
        start,
        stop,
        reset,
    };
};

export const useIO = () => {
    const { input, canvas, audio } = useContext(EmulatorContext);

    return {
        input,
        canvas,
        audio,
    };
};

export const useDebug = () => {
    const { debug } = useContext(EmulatorContext);

    return {
        performance: debug?.performance,
    };
};

export const meta = {
    name: 'CHIP-8',
    developer: 'Weisbecker',
    year: 1978,
    generation: null,
    wikipedia: 'https://en.wikipedia.org/wiki/CHIP-8',
    github: 'https://github.com/kabukki/wasm-chip8',
    path: '/other/chip8',
    picture,
    content,
};

export const init = async () => {
    const instance = await initWasm(wasm);

    set_panic_hook();

    return instance;
};
