import React from 'react';
import { Status, useStatus } from '@kabukki/wasm-chip8';

const colorMap = {
    [Status.NONE]: 'black',
    [Status.RUNNING]: 'green',
    [Status.IDLE]: 'grey',
    [Status.ERROR]: 'red',
};

export const Indicator = () => {
    const { status } = useStatus();

    return (
        <div style={{ width: '1em', height: '1em', backgroundColor: colorMap[status], borderRadius: '50%' }} />
    );
};
