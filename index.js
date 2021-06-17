import init, { Cpu } from './pkg/chip8.js';

const cyclesPerSecond = 60;

const [canvas] = document.getElementsByTagName('canvas');
const [input] = document.getElementsByTagName('input');
const context = canvas.getContext('2d');

canvas.width = 64 * 4;
canvas.height = 32 * 4;

function hex (num) {
    return `0x${num.toString(16).padStart(4, '0')}`;
}

async function main () {
    // Initialize emulator
    const wasm = await init();
    console.log('Initialized');

    input.addEventListener('change', async (e) => {
        const [file] = e.target.files;
        const buffer = await file.arrayBuffer();
        const rom = new Uint8Array(buffer);
        
        const cpu = Cpu.new(rom);
        console.log(cpu);

        setInterval(() => {
            const instruction = cpu.tick();
            console.log(hex(instruction.opcode));

            const data = new Uint8Array(wasm.memory.buffer, cpu.get_display(), 2048);
            context.beginPath();
            requestAnimationFrame(() => {
                for (let y = 0; y < 32; y++) {
                    for (let x = 0; x < 64; x++) {
                        context.fillStyle = data[x + y * 64] === 1 ? 'yellow' : 'black';
                        context.fillRect(x * 4, y * 4, 4, 4);
                    }
                }
                // context.putImageData(new ImageData(data, 64, 32), 0, 0);
            });
            context.stroke();
        }, 1000 / cyclesPerSecond);
    });
}

main().catch(console.error);
