import init, { Cpu } from './pkg/chip8.js';

const cyclesPerSecond = 100;
const scale = 8;

const [canvas] = document.getElementsByTagName('canvas');
const [input] = document.getElementsByTagName('input');
const inputColorOn = document.getElementById('color-on');
const inputColorOff = document.getElementById('color-off');
const context = canvas.getContext('2d');

canvas.width = 64 * scale;
canvas.height = 32 * scale;

function hex (num) {
    return `0x${num.toString(16).padStart(4, '0')}`;
}

async function main () {
    // Initialize emulator
    const wasm = await init();
    console.log('Initialized');
    let interval = null;

    input.addEventListener('change', async (e) => {
        const [file] = e.target.files;
        const buffer = await file.arrayBuffer();
        const rom = new Uint8Array(buffer);
        
        const cpu = Cpu.new(rom);
        console.log(cpu);

        if (interval) {
            clearInterval(interval);
        }

        interval = setInterval(() => {
            const instruction = cpu.tick();
            console.log(hex(instruction.opcode));

            const data = new Uint8Array(wasm.memory.buffer, cpu.get_display(), 2048);
            context.beginPath();
            requestAnimationFrame(() => {
                for (let y = 0; y < 32; y++) {
                    for (let x = 0; x < 64; x++) {
                        context.fillStyle = data[x + y * 64] === 1 ? inputColorOn.value : inputColorOff.value;
                        context.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
                // context.putImageData(new ImageData(data, 64, 32), 0, 0);
            });
            context.stroke();
        }, 1000 / cyclesPerSecond);
    });
}

main().catch(console.error);
