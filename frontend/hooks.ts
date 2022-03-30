import { useEffect, useRef, useState } from 'react';
import GameStats from 'game-stats';

export const useSettings = () => {
    const [modules, setModules] = useState(['performance', 'input']);
    const [ui, setUI] = useState({
        colorOn: '#ffffff',
        colorOff: '#000000',
        crt: true,
    });
    const [input, setInput] = useState({
        map: {
            '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
            'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
            'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
            'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF,
        },
    });

    return {
        modules,
        ui,
        input,
        setModules,
        setUI,
        setInput,
    };
};

export const useAudio = (type: OscillatorType = 'sine', frequency = 440) => {
    const [context] = useState(() => new AudioContext());
    const [gain] = useState(() => context.createGain());
    const [oscillator] = useState(() => context.createOscillator());

    useEffect(() => {
        gain.gain.value = 1;
        gain.connect(context.destination);
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.start();
    }, []);
    
    return {
        sampleRate: context.sampleRate,
        start () {
            return context.resume();
        },
        stop () {
            return context.suspend();
        },
        play () {
            return oscillator.connect(gain);
        },
        pause () {
            return oscillator.disconnect();
        },
        volume (volume) {
            gain.gain.value = volume;
        },
        type (type) {
            oscillator.type = type;
        },
        frequency (frequency) {
            oscillator.frequency.value = frequency;
        },
    };
};

export const useAnimationFrame = () => {
    const stats = useRef(new GameStats());
    const handle = useRef<ReturnType<typeof requestAnimationFrame>>();

    return {
        stats: stats.current,
        start (callback) {
            const rafCallback = (timestamp) => {
                callback();
                stats.current.record(timestamp);
                // Don't run another frame if it has been canceled in the mean time
                if (handle.current) {
                    handle.current = requestAnimationFrame(rafCallback);
                }
            };
        
            handle.current = requestAnimationFrame(rafCallback);
        },
        stop () {
            cancelAnimationFrame(handle.current);
            handle.current = null;
        },
    };
};
