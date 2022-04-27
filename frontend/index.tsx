import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Statistics from 'game-stats/lib/interfaces/Statistics';

import wasm from '../backend/pkg/index_bg.wasm';
import initWasm, { Emulator, set_logger, set_panic_hook } from '../backend/pkg';
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
        emulator: ReturnType<Emulator['get_debug']>;
        performance: Statistics;
        logs: object[];
    };
    error?: Error;
    status: Status;
    input (key: Button, state: boolean): void;
    create (rom: Uint8Array): void;
    cycleCpu (): void;
    cycleTimer (): void;
    start (): void;
    stop (error?: Error): void;
    destroy (): void;
}

const EmulatorContext = createContext<IEmulatorContext>(null);
const logs = [];

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

    const wrapCycle = (cycle) => () => {
        try {
            cycle();
    
            if (emulator.beep()) {
                audio.play();
            } else {
                audio.pause();
            }

            setFrame(new ImageData(new Uint8ClampedArray(emulator.get_framebuffer()), 64, 32));
            setDebug({
                emulator: emulator.get_debug(),
                performance: raf.stats.stats(),
                logs,
            });
        } catch (err) {
            stop(err);
            // At this point, we can't get any debug info, but we can still provide the logs to help understand the error.
            setDebug((previous) => ({ ...previous, logs }));
        }
    };

    const cycleCpu = useCallback(wrapCycle(emulator?.cycle_until_cpu.bind(emulator)), [emulator]);
    const cycleTimer = useCallback(wrapCycle(emulator?.cycle_until_timer.bind(emulator)), [emulator]);
    
    const create = async (rom: Uint8Array) => {
        try {
            const emulator = Emulator.new(rom);
            setError(null);
            setDebug(null);
            setEmulator(emulator);
        } catch (err) {
            console.error(err);
        }
    };

    const start = () => {
        raf.start(cycleTimer);
        audio.start();
        setStatus(Status.RUNNING);
    };

    const stop = (error?: Error) => {
        audio.stop();
        raf.stop();
        if (error && error instanceof Error) {
            console.error(error);
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

    // Initialize
    useEffect(() => {
        (async () => {
            const instance = await initWasm(wasm);
    
            set_panic_hook((message) => setError(new Error(message)));
            set_logger((log) => logs.push(log));

            return instance;
        })().then((instance) => console.log(`CHIP-8 initialized`, instance)).catch(console.error);
    }, []);
    
    return (
        <EmulatorContext.Provider value={{
            frame,
            audio,
            debug,
            error,
            status,
            create,
            cycleCpu,
            cycleTimer,
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
    const { create, cycleCpu, cycleTimer, start, stop, destroy, error, status } = useContext(EmulatorContext);

    return {
        create,
        cycleCpu,
        cycleTimer,
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
        logs: debug?.logs,
        emulator: debug?.emulator,
        performance: debug?.performance,
    };
};
