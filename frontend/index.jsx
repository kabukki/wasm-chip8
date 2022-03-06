import React, { useRef, createContext, useEffect, useState, useCallback, useContext } from 'react';
import throttle from 'lodash.throttle';

import initWasm, { Chip8, set_panic_hook } from '../backend/pkg';
import wasm from '../backend/pkg/index_bg.wasm';

import picture from './assets/picture.png';
import content from './assets/content.png';

// export type Button = (
//     0x0 | 0x1 | 0x2 | 0x3 |
//     0x4 | 0x5 | 0x6 | 0x7 |
//     0x8 | 0x9 | 0xA | 0xB |
//     0xC | 0xD | 0xE | 0xF
// );

export const EmulatorContext = createContext({});

const useAudio = (type = 'sine', frequency = 440) => {
    const [context] = useState(() => new AudioContext());
    const [gain] = useState(() => context.createGain());
    const [oscillator] = useState(() => context.createOscillator());

    const start = () => {
        context.resume();
    };

    const stop = () => {
        context.suspend();
    };

    useEffect(() => {
        gain.gain.value = 1;
        gain.connect(context.destination);
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.start();
    }, []);
    
    return {
        sampleRate: context.sampleRate,
        start,
        stop,
        play () {
            oscillator.connect(gain);
        },
        pause () {
            oscillator.disconnect();
        },
    };
};

// useAnimationFrame -- with game-stats

export const EmulatorProvider = ({ children }) => {
    const canvas = useRef();
    const rafHandle = useRef();
    const audio = useAudio();
    const [emulator, setEmulator] = useState(null);
    const [error, setError] = useState(null);
    const [input, setInput] = useState(() => new Array(16).fill(false));

    const load = async (rom) => {
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
        const context = canvas.current.getContext('2d');
        const framebuffer = emulator.get_framebuffer();

        for (let y = 0; y < context.canvas.height; y++) {
            for (let x = 0; x < context.canvas.width; x++) {
                context.fillStyle = framebuffer[x + y * context.canvas.width] === 1 ? 'white' : 'black';
                context.fillRect(x, y, 1, 1);
            }
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

    const stop = (error) => {
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

    useEffect(() => {
        if (emulator) {
            start();
            return stop;
        }
    }, [emulator]);

    return (
        <EmulatorContext.Provider value={{
            canvas,
            inputState: input,
            input (key, state) {
                setInput((previous) => previous.map((pressed, index) => index === key ? state : pressed));
                emulator?.update_key(key, state);
            },
            load,
            start,
            stop,
            reset,
            error,
        }}>
            {children}
        </EmulatorContext.Provider>
    );
};

export const useDebug = () => {

};

export const useInput = (keymap) => {
    const { input } = useContext(EmulatorContext);

    const onKey = (e) => {
        if (e.key in keymap) {
            const key = keymap[e.key];
            switch (e.type) {
                case 'keydown':
                    input(key, true);
                    break;
                case 'keyup':
                    input(key, false);
                    break;
            }
            e.preventDefault();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', onKey);
        document.addEventListener('keyup', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('keyup', onKey);
        };
    }, [onKey]);
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

export * from './components';
