import React, { Suspense, useState } from 'react'

import { useSettings } from './hooks';
import { Chip8 } from './components/Chip8';

export const App = () => {
    const { settings, update } = useSettings();
    const [rom, setRom] = useState(null);

    return (
        <>
            <header className="p-4 mb-4 bg-gray-700 text-white text-center text-xl">
                <h1>CHIP-8</h1>
            </header>
            <main className="container mx-auto flex gap-4">
                <div>
                    <Suspense fallback={<p>Initializing...</p>}>
                        <Chip8 rom={rom} settings={settings} />
                    </Suspense>
                    💾 <input type="file" onChange={(e) => e.target.files[0]?.arrayBuffer().then((buffer) => setRom(new Uint8Array(buffer)))}/>
                </div>
                <div className="space-y-4">
                    <div>
                        <h2 className="border-b border-grey-500">⚙️ Settings</h2>
                        <label className="block">
                            <b>ON</b> color
                            <input type="color" value={settings.display.colorOn} onChange={(e) => update({ display: { colorOn: e.target.value } })}/>
                        </label>
                        <label className="block">
                            <b>OFF</b> color
                            <input type="color" value={settings.display.colorOff} onChange={(e) => update({ display: { colorOff: e.target.value } })}/>
                        </label>
                        <label>
                            <input type="checkbox" checked={settings.audio} onChange={(e) => update({ audio: console.log(e.target.checked) || e.target.checked })} />
                            Sound <b>{settings.audio ? 'ON' : 'OFF'}</b>
                        </label>
                    </div>
                    <div>
                        <h2 className="border-b border-grey-500">⏱ Stats</h2>
                        <p><b>CPU clock speed</b> {Math.round(1000 / settings.core.clockSpeed)}Hz</p>
                        <p><b>Timer frequency</b> {Math.round(1000 / settings.core.timerFrequency)}Hz</p>
                        <p><b>Display refresh rate</b> {settings.display.refreshRate} FPS</p>
                    </div>
                </div>
            </main>
        </>
    );
};
