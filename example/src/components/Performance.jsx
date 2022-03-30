import React from 'react';
import pretty from 'pretty-ms';
import { useStatus } from '@kabukki/wasm-chip8';

const hex = (num, padding = 4) => `0x${num.toString(16).padStart(padding, '0')}`;

export const Performance = () => {
    const { performance, lastInstruction } = useStatus();

    return (
        <dl>
            <dt>FPS</dt>
            <dd>{performance?.fps?.toString() || '-'}</dd>
            <dt>Delta</dt>
            <dd>{performance ? pretty(performance?.delta) : '-'}</dd>
            <dt>Current</dt>
            <dd>{performance?.frame?.toString() || '-'}</dd>
            <dt>Elapsed time</dt>
            <dd>{performance ? pretty(performance.timestamp, { colonNotation: true, keepDecimalsOnWholeSeconds: true, secondsDecimalDigits: 3 }) : '-'}</dd>
            <dt className="font-bold">Last insruction (2 bytes)</dt>
            <dd>{lastInstruction ? hex(lastInstruction.opcode) : '-'}</dd>
        </dl>
    );
};
