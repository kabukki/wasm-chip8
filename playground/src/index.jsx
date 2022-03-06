import React, { StrictMode, useContext } from 'react';
import { render } from 'react-dom';
import { init, EmulatorProvider, EmulatorContext, useInput, Keypad } from '@kabukki/wasm-chip8';

const App = () => {
    const { load, canvas, inputState } = useContext(EmulatorContext);
    
    useInput({
        '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
        'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
        'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
        'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF,
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
            <div className="h-full relative bg-black flex-1">
                <canvas
                    className="absolute inset-0 h-full w-full object-contain"
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

init().then(() => {
    render(
        <StrictMode>
            <EmulatorProvider>
                <App />
            </EmulatorProvider>
        </StrictMode>,
        document.querySelector('#app'),
    );
});
