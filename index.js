import init, { Chip8 } from './pkg/chip8.js';

const CLOCK_RATE = 1000 / 500;
const TIMER_RATE = 1000 / 60;
const FRAME_RATE = 30;

const [canvas] = document.getElementsByTagName('canvas');
const [input] = document.getElementsByTagName('input');
const inputColorOn = document.getElementById('color-on');
const inputColorOff = document.getElementById('color-off');
const context = canvas.getContext('2d');

const scale = 8;
canvas.width = 64 * scale;
canvas.height = 32 * scale;

const keyMap = {
    '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
    'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
    'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
    'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF,
};

function hex (num) {
    return `0x${num.toString(16).padStart(4, '0')}`;
}

async function main () {
    // Initialize emulator
    const wasm = await init();
    const audio = new window.AudioContext();
    const oscillator = audio.createOscillator();
    audio.suspend();
    oscillator.connect(audio.destination);
    oscillator.type = 'square';
    oscillator.frequency.value = 440;
    oscillator.start();

    input.addEventListener('change', async (e) => {
        const [file] = e.target.files;
        const buffer = await file.arrayBuffer();
        const rom = new Uint8Array(buffer);

        const chip8 = Chip8.new(rom);

        // CPU
        setInterval(() => {
            const instruction = chip8.step_cpu();
            // console.log(hex(instruction.opcode));
        }, CLOCK_RATE);

        // Timers
        setInterval(() => {
            chip8.step_timers();
            if (chip8.beep()) {
                audio.resume();
            } else if (audio.state) {
                audio.suspend();
            }
        }, TIMER_RATE);

        // Display
        setInterval(() => {
            const data = new Uint8Array(wasm.memory.buffer, chip8.get_framebuffer(), 2048);
            requestAnimationFrame(() => {
                for (let y = 0; y < 32; y++) {
                    for (let x = 0; x < 64; x++) {
                        context.fillStyle = data[x + y * 64] === 1 ? inputColorOn.value : inputColorOff.value;
                        context.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
            });
        }, FRAME_RATE);

        window.addEventListener('keydown', ({ key }) => {
            if (key in keyMap) {
                chip8.set_key(keyMap[key], true);
            }
        });

        window.addEventListener('keyup', ({ key }) => {
            if (key in keyMap) {
                chip8.set_key(keyMap[key], false);
            }
        });
    });
}

main().catch(console.error);
