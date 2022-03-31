import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import throttle from 'lodash.throttle';
import Statistics from 'game-stats/lib/interfaces/Statistics';

import initWasm, { Chip8, set_panic_hook } from '../backend/pkg';
import wasm from '../backend/pkg/index_bg.wasm';
import { useAudio, useAnimationFrame } from './hooks';

import picture from './assets/picture.png';
import content from './assets/content.png';

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

interface IDebug {
    performance: Statistics;
}

interface IEmulatorContext {
    frame: ImageData;
    audio: ReturnType<typeof useAudio>;
    debug: IDebug;
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
    const [emulator, setEmulator] = useState<Chip8>(null);
    const [error, setError] = useState<Error>(null);
    const [debug, setDebug] = useState<IDebug>(null);
    const [status, setStatus] = useState<Status>(Status.NONE);

    const cycleCPU = useCallback(throttle(() => {
        return emulator.cycle_cpu();
    }, 1000 / 500), [emulator]);

    const cycleTimers = useCallback(() => {
        emulator.cycle_timers();
    
        if (emulator.beep()) {
            audio.play();
        } else {
            audio.pause();
        }
    }, [emulator]);

    const getFrame = () => new ImageData(new Uint8ClampedArray(emulator.get_framebuffer()), 64, 32);

    const cycle = () => {
        try {
            const lastInstruction = cycleCPU();
            cycleTimers();
            setFrame(getFrame());
            setDebug((previous) => ({
                ...previous,
                performance: raf.stats.stats(),
                lastInstruction,
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
    const { create, start, stop, destroy } = useContext(EmulatorContext);

    return {
        create,
        start,
        stop,
        destroy,
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

export const useStatus = () => {
    const { debug, error, status } = useContext(EmulatorContext);

    return {
        ...(debug || {}),
        error,
        status,
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
