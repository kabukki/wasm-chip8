import React, { useState, useEffect, useCallback } from 'react';

import init, { Chip8 as Emulator } from '../../lib/pkg';

import { useAudio } from '../hooks';
import { suspend, hex } from '../utils';
import { Display } from './Display';

const wasmRes = suspend(init());

export const Chip8 = ({ rom, settings }) => {
    const [chip8, setChip8] = useState(null);
    const [data, setData] = useState(null);
    const { play, pause, isPlaying } = useAudio();
    const wasm = wasmRes();
    
    const onKeydown = useCallback(({ key }) => {
        if (key in settings.keyboard.map) {
            chip8?.set_key(settings.keyboard.map[key], true);
        }
    }, [chip8]);
    const onKeyup = useCallback(({ key }) => {
        if (key in settings.keyboard.map) {
            chip8?.set_key(settings.keyboard.map[key], false);
        }
    }, [chip8]);
    // On error, terminate the emulator
    const onError = (err) => {
        console.error(err);
        setChip8(null);
    };

    // Create new emulator instance when ROM changes
    useEffect(() => {
        if (rom) {
            setChip8(Emulator.new(rom));
        } else {
            console.log('ROM not set');
        }
    }, [rom]);

    // Setup loops when a new emulator is set up
    useEffect(() => {
        if (chip8) {
            const intervals = [
                // CPU
                setInterval(() => {
                    try {
                        const instruction = chip8.step_cpu();
                        // console.log(hex(instruction.opcode));
                    } catch (err) {
                        onError(err);
                    }
                }, settings.core.clockSpeed),
                // Timers
                setInterval(() => {
                    try {
                        chip8.step_timers();
                        if (settings.audio) {
                            if (chip8.beep()) {
                                play();
                            } else {
                                pause();
                            }
                        }
                    } catch (err) {
                        onError(err);
                    }
                }, settings.core.timerFrequency),
                // Display
                setInterval(() => {
                    try {
                        setData(new Uint8Array(wasm.memory.buffer, chip8.get_framebuffer(), 2048));
                    } catch (err) {
                        onError(err);
                    }
                }, settings.display.refreshRate),
            ]
            return () => intervals.forEach(window.clearInterval);
        } else {
            console.log('Emulator not set');
        }
    }, [chip8]);

    // Keyboard listeners
    useEffect(() => {
        document.addEventListener('keydown', onKeydown);
        document.addEventListener('keyup', onKeyup);
        return () => {
            document.removeEventListener('keydown', onKeydown);
            document.removeEventListener('keyup', onKeyup);
        };
    }, [chip8]);

    return (
        <Display data={data} width={64} height={32} scale={8} settings={settings.display}>
            {settings.audio ? (isPlaying ? '🔊' : '🔈') : '🔇'}
        </Display>
    );
};
