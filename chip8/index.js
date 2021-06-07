const FPS = 120;
const SIZE = 64;

const [canvas] = document.getElementsByTagName('canvas');
const context = canvas.getContext('2d');

canvas.width = SIZE;
canvas.height = SIZE;

async function main () {
    const { instance } = await WebAssembly.instantiateStreaming(fetch('cpu.wasm'));
    console.log(instance.exports);
    // Load ROM
    const rom = new Uint16Array(instance.exports.memory.buffer, instance.exports.rom.value, 4096);
    console.log(rom);
    
    // Read memory as RGBA format
    const data = new Uint8ClampedArray(instance.exports.memory.buffer, instance.exports.map.value, SIZE * SIZE * 4);
    console.log(data);
    
    setInterval(() => {
        // Put next pixel
        instance.exports.tick();
        requestAnimationFrame(() => {
            context.putImageData(new ImageData(data, SIZE, SIZE), 0, 0);
        });
    }, 1000 / FPS);
}

main().catch(console.error);
