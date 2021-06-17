import init, { Cpu } from './pkg/chip8.js';

const cyclesPerSecond = 1;

const [canvas] = document.getElementsByTagName('canvas');
const [input] = document.getElementsByTagName('input');
const context = canvas.getContext('2d');

canvas.width = 64;
canvas.height = 32;

function hex (num) {
    return `0x${num.toString(16).padStart(4, '0')}`;
}

async function main () {
    // Initialize emulator
    await init();
    console.log('Initialized');

    input.addEventListener('change', async (e) => {
        const [file] = e.target.files;
        const buffer = await file.arrayBuffer();
        const rom = new Uint8Array(buffer);

        const cpu = Cpu.new(rom);
        console.log(cpu);

        setInterval(() => {
            const insruction = cpu.cycle();
            console.log(hex(insruction.opcode));
            // requestAnimationFrame(() => {
            //     context.putImageData(new ImageData(data, 64, 32), 0, 0);
            // });
        }, 1000 / cyclesPerSecond);
    });
}

main().catch(console.error);
