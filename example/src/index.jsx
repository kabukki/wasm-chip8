import React, { StrictMode, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { init, EmulatorProvider, Keypad, useIO, useLifecycle } from '@kabukki/wasm-chip8';

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
    const { load } = useLifecycle();
    const { input, canvas } = useIO();

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
        const fingerprint = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
        
        load(buffer);
        
        // Rom model on consumer frontend
        console.log({
            name: file.name,
            buffer,
            fingerprint,
        });

        e.preventDefault();
    };

    return (
        <main>
            WOW
            <input type="file" onChange={onChange} />
            <div>
                <canvas
                    style={{ imageRendering: 'pixelated', width: '100%' }}
                    ref={canvas}
                    width={64}
                    height={32}
                />
                <Keypad input={inputState} />
                {/* {crt && <div className="absolute inset-0 crt" />} */}
            </div>
        </main>
    );
};

init().then(() => render(
    <StrictMode>
        <EmulatorProvider>
            <App />
        </EmulatorProvider>
    </StrictMode>,
    document.querySelector('#app'),
));
