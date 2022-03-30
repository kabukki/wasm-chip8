import React from 'react';
import { useIO } from '@kabukki/wasm-chip8';

export const Display = () => {
    const { canvas } = useIO();

    return (
        <canvas
            style={{ imageRendering: 'pixelated', width: '100%' }}
            ref={canvas}
            width={64}
            height={32}
        />
    );
};
