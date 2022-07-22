# 💾 CHIP-8

A **CHIP-8** emulator written in <img align="center" src="https://raw.githubusercontent.com/kabukki/kabukki/master/icons/rust.svg"/> Rust, compiled to <img align="center" src="https://raw.githubusercontent.com/kabukki/kabukki/master/icons/wasm.svg"/> WebAssembly through [wasm-pack](https://github.com/rustwasm/wasm-pack), and exposed with <img align="center" src="https://raw.githubusercontent.com/kabukki/kabukki/master/icons/ts.svg"/> Typescript thanks to [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen).

> CHIP-8 is an interpreted programming language, developed by Joseph Weisbecker. It was initially used on the COSMAC VIP and Telmac 1800 8-bit microcomputers in the mid-1970s. CHIP-8 programs are run on a CHIP-8 virtual machine. It was made to allow video games to be more easily programmed for these computers.

## Overview

### Timing

The emulator synchronizes to video with the [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) function, which usually matches the refresh rate of the display.
- CPU runs at 500Hz
- Timers run at 60Hz

At every repaint, enough emulator cycles are run to simulate that the duration for one frame has passed. Given an ideal refresh rate of 60FPS, that is 1/60s.

### ASI

✅ All 35 opcodes are implemented.

### Known limitations

Extensions are not implemented.

### Tests

- [test_opcode](https://github.com/corax89/chip8-test-rom) ✅
- [chiptest](https://github.com/corax89/chip8-test-rom) ✅
- [chiptest-mini](https://github.com/corax89/chip8-test-rom) ✅

## Usage

### Sample code

```js
import { Chip8 } from '@kabukki/wasm-chip8';

const canvas = document.querySelector('canvas');
canvas.width = Chip8.VIDEO_WIDTH;
canvas.height = Chip8.VIDEO_HEIGHT;

const input = document.querySelector('input');
input.addEventListener('change', async (e) => {
    try {
        const rom = new Uint8Array(await e.target.files[0]?.arrayBuffer());
        const emulator = await Chip8.new(rom)
        emulator.canvas = canvas;
        emulator.start();
    } catch (err) {
        console.error(err);
    }
});
```

### API

The full API is documented on the [wiki](https://github.com/kabukki/wasm-chip8/wiki/API)!

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
- https://github.com/offstatic/chiptest
