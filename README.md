# 💾 CHIP-8

A **CHIP-8** emulator written in Rust, compiled to WebAssemly through [wasm-pack](https://github.com/rustwasm/wasm-pack), and consumed by React thanks to [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen).

> CHIP-8 is an interpreted programming language, developed by Joseph Weisbecker. It was initially used on the COSMAC VIP and Telmac 1800 8-bit microcomputers in the mid-1970s. CHIP-8 programs are run on a CHIP-8 virtual machine. It was made to allow video games to be more easily programmed for these computers.

## Usage

Wrap your application in the `EmulatorProvider`, and consume it through the provided hooks.

```jsx
import React from 'react';
import { render } from 'react-dom';
import { init, EmulatorProvider, Display, useLifecycle } from '@kabukki/wasm-chip8';

export const App = () => {
    const { create } = useLifecycle();

    const onChange = async (e) => {
        create(new Uint8Array(await e.target.files[0]?.arrayBuffer()));
        e.preventDefault();
    };

    return (
        <main>
            <input type="file" onChange={onChange} />
            <Display />
        </main>
    );
};

init().then(() => render(
    <EmulatorProvider>
        <App />
    </EmulatorProvider>,
    document.querySelector('#app'),
)).catch(console.error);
```

### `EmulatorProvider`

Wrap your app with this provider at the highest level where you want to use the emulator. It contains an emulator instance and internal logic that you can access in child components. Under the hood, a context is created but only accessible through hooks to maintain coherence in the exposed API.

### `Display`

The `Display` component is a simple canvas to which video output is drawn. You can customize it however you need to.

### `useLifecycle`

This hook provides functionality to control the emulator's lifecycle.

- `create` create a new emulator with the provided ROM loaded into memory, and automatically start it
- `start` resume emulator execution
- `stop` stop emulator execution
- `destroy` destroys the emulator instance

### `useIO`

This hook provides functionality to interact with input and output interfaces.

- `input` send an input signal
- `audio` methods to control audio output

### `useStatus`

This hook provides various information regarding emulator status.

- `performance` measures of browser frame performance
- `lastInstruction` the last instruction executed by the emulator
- `error` error thrown during emulator execution, if any
- `status` current emulator status
    - `Status.NONE` no emulator instance
    - `Status.RUNNING` emulator is running
    - `Status.IDLE` emulator is paused
    - `Status.ERROR` emulator encountered an error

## Status

### ASI

All 35 opcodes are implemented.

### Known limitations

*TODO*

## Resources

### Chip-8 reference

- https://en.wikipedia.org/wiki/CHIP-8
- http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
- https://github.com/mattmikolay/chip-8/wiki/CHIP%E2%80%908-Technical-Reference
- https://archive.org/details/byte-magazine-1978-12/page/n109/mode/2up

### Tooling

- https://rustwasm.github.io/docs/wasm-bindgen/
- https://github.com/emscripten-core/emscripten/wiki/Porting-Examples-and-Demos
- https://jamesfriend.com.au/porting-pce-emulator-browser
- https://www.secondstate.io/articles/wasi-access-system-resources/

### Examples & tutorials

- https://github.com/letmaik/chip8
- https://github.com/ColinEberhardt/wasm-rust-chip8
- https://github.com/LucasHill/chip8-rust-wasm
- https://github.com/k0nserv/chip-8
- https://github.com/faizilham/chip8-rs
- https://github.com/alexalikiotis/rusty-chip8
- https://multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/
- https://rustwasm.github.io/docs/book/
- http://emulator101.com/
- http://blog.alexanderdickson.com/javascript-chip-8-emulator

### ROMs

- https://github.com/loktar00/chip8/tree/master/roms
- https://github.com/corax89/chip8-test-rom
- https://github.com/badlogic/chip8/tree/master/roms
- https://johnearnest.github.io/chip8Archive/
