import React, { useRef, createContext, useEffect, useState, useCallback, useContext, MutableRefObject } from 'react';
import throttle from 'lodash.throttle';

import initWasm, { Chip8, set_panic_hook } from '../backend/pkg';
import wasm from '../backend/pkg/index_bg.wasm';
import { useAudio } from './hooks';

import picture from './assets/picture.png';
import content from './assets/content.png';

type Button = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

interface IEmulatorContext {
    canvas: MutableRefObject<HTMLCanvasElement>;
    error?: Error;
    audio: ReturnType<typeof useAudio>;
    input (key: Button, state: boolean): void;
    load (rom: Uint8Array): void;
    start (): void;
    stop (error?: Error): void;
    reset (): void;
}

export const EmulatorContext = createContext<IEmulatorContext>(null);

/**
 * Provides emulator with core functionality
 * TODO: useAnimationFrame -- with game-stats; https://css-tricks.com/using-requestanimationframe-with-react-hooks/
 */
export const EmulatorProvider = ({ children }) => {
    const canvas = useRef<HTMLCanvasElement>();
    const rafHandle = useRef<ReturnType<typeof requestAnimationFrame>>();
    const audio = useAudio();
    const [emulator, setEmulator] = useState<Chip8>(null);
    const [error, setError] = useState(null);
    const [debug, setDebug] = useState(() => ({}));

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

    const start = () => {
        const rafCallback = (timestamp) => {
            try {
                console.log('rAF');
                cycleCPU();
                cycleTimers();
                paint();
                // this.stats.record(timestamp);
                // this.emitSave();
                // this.emitDebug();
                rafHandle.current = requestAnimationFrame(rafCallback);
            } catch (err) {
                stop(err);
            }
        };

        rafHandle.current = requestAnimationFrame(rafCallback);
        audio.start();
    };

    const stop = (error?: Error) => {
        audio.stop();
        cancelAnimationFrame(rafHandle.current);
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

export const useDebug = () => {};

// const usePerformance = () => {
//     return {
//         fps,
//         delta,
//         frame,
//         timestamp,
//     };
// };

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
