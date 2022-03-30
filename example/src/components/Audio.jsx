import React from 'react';
import { useIO } from '@kabukki/wasm-chip8';

export const Audio = () => {
    const { audio } = useIO();

    const onVolume = (e) => audio.volume(e.target.valueAsNumber);
    const onFrequency = (e) => audio.frequency(e.target.valueAsNumber);
    const onType = (e) => audio.type(e.target.value);

    return (
        <dl>
            <dt>Sample rate</dt>
            <dd>{audio?.sampleRate.toLocaleString()} Hz</dd>
            <dt>Volume</dt>
            <dd><input type="range" min={0} max={1} step={0.01} defaultValue={1} onChange={onVolume} /></dd>
            <dt>Frequency</dt>
            <dd><input type="range" min={20} max={20000} step={1} defaultValue={440} onChange={onFrequency} /></dd>
            <dt>Type</dt>
            <dd>
                <select defaultValue={audio?.baseType} onChange={onType}>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                </select>
            </dd>
        </dl>
    );
};
