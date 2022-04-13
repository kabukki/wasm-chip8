import React, { createContext, useState, useContext, useEffect } from 'react';
import Statistics from 'game-stats/lib/interfaces/Statistics';

import wasm from '../backend/pkg/index_bg.wasm';
import initWasm, { Chip8, Chip8Debug, set_panic_hook } from '../backend/pkg';
import { useAudio, useAnimationFrame } from './hooks';

export type Button = (
    0x0 | 0x1 | 0x2 | 0x3 |
    0x4 | 0x5 | 0x6 | 0x7 |
    0x8 | 0x9 | 0xA | 0xB |
    0xC | 0xD | 0xE | 0xF
);

export enum Status {
    NONE,
    IDLE,
    RUNNING,
    ERROR,
}

interface IEmulatorContext {
    frame: ImageData;
    audio: ReturnType<typeof useAudio>;
    debug: {
        vm: Chip8Debug;
        performance: Statistics;
    };
    error?: Error;
    status: Status;
    input (key: Button, state: boolean): void;
    create (rom: Uint8Array): void;
    start (): void;
    stop (error?: Error): void;
    destroy (): void;
}

export const EmulatorContext = createContext<IEmulatorContext>(null);

/**
 * Provides emulator with core functionality
 */
export const EmulatorProvider = ({ children }) => {
    const raf = useAnimationFrame();
    const audio = useAudio();
    const [frame, setFrame] = useState(null);
    const [emulator, setEmulator] = useState(null);
    const [error, setError] = useState(null);
    const [debug, setDebug] = useState(null);
    const [status, setStatus] = useState(Status.NONE);

    const cycle = () => {
        try {
            emulator.cycle_cpu();
            emulator.cycle_timers();
    
            if (emulator.beep()) {
                audio.play();
            } else {
                audio.pause();
            }

            setFrame(new ImageData(new Uint8ClampedArray(emulator.get_framebuffer()), 64, 32));
            setDebug(() => ({
                vm: emulator.get_debug(),
                performance: raf.stats.stats(),
            }));
        } catch (err) {
            stop(err);
        }
    };

    const create = async (rom: Uint8Array) => {
        try {
            const emulator = Chip8.new(rom);
            setError(null);
            setDebug(null);
            setEmulator(emulator);
        } catch (err) {
            console.error(err);
            setError(err);
        }
    };

    const start = () => {
        raf.start(cycle);
        audio.start();
        setStatus(Status.RUNNING);
    };

    const stop = (error?: Error) => {
        audio.stop();
        raf.stop();
        if (error && error instanceof Error) {
            console.error(error);
            setError(error);
            setStatus(Status.ERROR);
        } else {
            setStatus(Status.IDLE);
        }
    };

    const destroy = () => {
        setEmulator(null);
    };

    const input = (key: Button, state: boolean) => {
        emulator?.update_key(key, state);
    };

    // Auto-start emulator on load
    useEffect(() => {
        if (emulator) {
            start();
            return stop;
        } else {
            setStatus(Status.NONE);
            setDebug(null);
        }
    }, [emulator]);
    
    return (
        <EmulatorContext.Provider value={{
            frame,
            audio,
            debug,
            error,
            status,
            create,
            start,
            stop,
            destroy,
            input,
        }}>
            {children}
        </EmulatorContext.Provider>
    );
};

export const useLifecycle = () => {
    const { create, start, stop, destroy, error, status } = useContext(EmulatorContext);

    return {
        create,
        start,
        stop,
        destroy,
        error,
        status,
    };
};

export const useIO = () => {
    const { input, frame, audio } = useContext(EmulatorContext);

    return {
        frame,
        audio,
        input,
    };
};

export const useDebug = () => {
    const { debug } = useContext(EmulatorContext);

    return {
        cpu: debug?.vm.cpu,
        keypad: debug?.vm.keypad,
        performance: debug?.performance,
    };
};

export const init = async () => {
    const instance = await initWasm(wasm);

    set_panic_hook();

    return instance;
};
