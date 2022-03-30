import React from 'react';
import { Display } from '@kabukki/wasm-chip8';

export const Video = () => (
    <div>
        <Display />
        {/* {crt && <div className="absolute inset-0 crt" />} */}
    </div>
);
