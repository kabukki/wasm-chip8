import React, { StrictMode, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { init, EmulatorProvider, useIO, useLifecycle, useStatus, Status } from '@kabukki/wasm-chip8';
import pretty from 'pretty-bytes';

import { Keypad, Video, Audio, Performance, Indicator } from './components';

import './index.css';

const useInput = ({ keymap, onInput }) => {
    const [input, setInput] = useState(() => new Array(16).fill(false));

    const onKey = (e) => {
        if (e.key in keymap) {
            const key = keymap[e.key];
            switch (e.type) {
                case 'keydown':
                    onInput(key, true);
                    setInput((previous) => previous.map((pressed, index) => index === key ? true : pressed));
                    break;
                case 'keyup':
                    onInput(key, false);
                    setInput((previous) => previous.map((pressed, index) => index === key ? false : pressed));
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

    return input;
};

const App = () => {
    const { input } = useIO();
    const { status, error } = useStatus();
    const { create, start, stop, destroy } = useLifecycle();

    const inputState = useInput({
        keymap: {
            '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
            'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
            'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
            'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF,
        },
        onInput: input,
    });

    const onChange = async (e) => {
        const [file] = e.target.files;
        const buffer = new Uint8Array(await file?.arrayBuffer());
        
        create(buffer);
        console.log(`Loaded ROM ${file.name} (${pretty(buffer.byteLength)})`);

        e.preventDefault();
    };

    if (status === Status.NONE) {
        return (
            <input type="file" onChange={onChange} style={{ display: 'block', margin: 'auto' }} />
        );
    } else if (status === Status.ERROR) {
        return (
            <main>
                <b style={{ color: 'crimson' }}>Oops...</b>
                <hr />
                <pre>{error?.stack}</pre>
                <input type="file" onChange={onChange} style={{ display: 'block', margin: 'auto' }} />
            </main>
        );
    } else {
        return (
            <main style={{ display: 'flex', alignItems: 'center' }}>
                <section>
                    <Keypad input={inputState} style={{ display: 'block', height: '8em' }} />
                    <Audio />
                    <Performance />
                </section>
                <section style={{ flex: 1 }}>
                    <Video />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                        <Indicator />
                        {status === Status.RUNNING ? <button onClick={stop}>Stop</button> : <button onClick={start}>Start</button>}
                        <button onClick={destroy}>Terminate</button>
                    </div>
                </section>
            </main>
        );
    }
};

init().then(() => render(
    <StrictMode>
        <EmulatorProvider>
            <App />
        </EmulatorProvider>
    </StrictMode>,
    document.querySelector('#app'),
)).catch(console.error);
