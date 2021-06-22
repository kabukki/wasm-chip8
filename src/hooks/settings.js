import { useState } from 'react';
import merge from 'lodash.merge';

export const useSettings = () => {
    const [settings, setSettings] = useState({
        core: {
            clockSpeed: 1000 / 200,
            timerFrequency: 1000 / 60,
        },
        display: {
            colorOn: '#ffffff',
            colorOff: '#000000',
            refreshRate: 30,
        },
        audio: true,
        keyboard: {
            map: {
                '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
                'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
                'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
                'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF,
            },
        },
    });

    return {
        settings,
        update (newSettings) {
            setSettings((oldSettings) => merge({}, oldSettings, newSettings));
        },
    };
};
