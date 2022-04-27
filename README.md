# 💾 CHIP-8

A **CHIP-8** emulator written in <img align="center" src="https://raw.githubusercontent.com/kabukki/kabukki/master/icons/rust.svg"/> Rust, compiled to <img align="center" src="https://raw.githubusercontent.com/kabukki/kabukki/master/icons/wasm.svg"/> WebAssemly through [wasm-pack](https://github.com/rustwasm/wasm-pack), and exposed with <img align="center" src="https://raw.githubusercontent.com/kabukki/kabukki/master/icons/react.svg"/> React thanks to [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen).

> CHIP-8 is an interpreted programming language, developed by Joseph Weisbecker. It was initially used on the COSMAC VIP and Telmac 1800 8-bit microcomputers in the mid-1970s. CHIP-8 programs are run on a CHIP-8 virtual machine. It was made to allow video games to be more easily programmed for these computers.

## Status

### ASI

✅ All 35 opcodes are implemented.

### Known limitations

*TODO*

## Usage

Wrap your application in the `EmulatorProvider`, and consume it through the provided hooks.

```jsx
import React, { useRef }from 'react';
import { render } from 'react-dom';
import { EmulatorProvider, useIO, useLifecycle } from '@kabukki/wasm-chip8';

export const App = () => {
    const canvas = useRef(null);
    const { frame } = useIO();
    const { create } = useLifecycle();

    const onChange = async (e) => {
        create(new Uint8Array(await e.target.files[0]?.arrayBuffer()));
        e.preventDefault();
    };

    useEffect(() => {
        if (frame) {
            canvas.current.getContext('2d').putImageData(frame, 0, 0);
        }
    }, [frame]);

    return (
        <main>
            <input type="file" onChange={onChange} />
            <canvas ref={canvas} width={frame?.width} height={frame?.height} />
        </main>
    );
};

render(
    <EmulatorProvider>
        <App />
    </EmulatorProvider>,
    document.querySelector('#app'),
);
```

### `EmulatorProvider`

Wrap your app with this provider at the highest level where you want to use the emulator. Internally, it sets up the WebAssembly module to be used, contains an emulator instance and internal logic that you can access in child components. Under the hood, a context is created but only accessible through hooks to maintain coherence in the exposed API.

### `useLifecycle`

This hook provides insight and functionality to control the emulator's lifecycle.

- `create` create a new emulator with the provided ROM loaded into memory, and automatically start it
- `cycleCpu` runs a single CPU cycle (~1/500s)
- `cycleTimer` runs a single timer cycle (~1/60s)
- `start` resume emulator execution
- `stop` stop emulator execution
- `destroy` destroys the emulator instance
- `error` error that caused a `panic!` during execution, if any
- `status` current emulator status
    - `Status.NONE` no emulator instance
    - `Status.RUNNING` emulator is running
    - `Status.IDLE` emulator is paused
    - `Status.ERROR` emulator encountered an error

### `useIO`

This hook provides functionality to interact with input and output interfaces.

- `frame` the current video frame
- `audio` methods to control audio output
- `input` send an input signal

### `useDebug`

This hook provides various information regarding emulation status.

- `logs` emulator logs (nestest-style) produced through Rust's [log](https://crates.io/crates/log) facade.
- `emulator` emulator state
- `performance` measures of browser frame performance

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
