import loader from 'https://cdn.jsdelivr.net/npm/@assemblyscript/loader/index.js';

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
    const instance = await loader.instantiate(fetch('dist/chip8.wasm'));
    console.log(instance.exports);

    // Read memory as RGBA format
    const ram = instance.exports.__getUint8ArrayView(instance.exports.ram.value);
    console.log(ram);

    input.addEventListener('change', async (e) => {
        const [file] = e.target.files;
        const buffer = await file.arrayBuffer();
        const rom = new Uint8Array(buffer);
        // Write ROM to emulator memory
        // Program ROM should be written @ 0x200
        for (const [index, byte] of rom.entries()) {
            console.log(index, hex(byte));
            ram[0x200 + index] = byte;
        }

        setInterval(() => {
            console.log(
                hex(instance.exports.currentPC()),
                hex(instance.exports.currentInstruction())
            );
            instance.exports.tick();
            // requestAnimationFrame(() => {
            //     context.putImageData(new ImageData(data, 64, 32), 0, 0);
            // });
        }, 1000 / cyclesPerSecond);
    });
}

main().catch(console.error);
