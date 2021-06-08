import loader from 'https://cdn.jsdelivr.net/npm/@assemblyscript/loader/index.js';

const FPS = 1;
const SIZE = 32;

const [canvas] = document.getElementsByTagName('canvas');
const context = canvas.getContext('2d');

canvas.width = SIZE;
canvas.height = SIZE;

async function main () {
    const instance = await loader.instantiate(fetch('dist/chip8.wasm'));
    console.log(instance.exports);

    // Read memory as RGBA format
    const data = instance.exports.__getUint8ClampedArrayView(instance.exports.map.value);
    console.log(data);

    setInterval(() => {
        instance.exports.tick();
        console.log(data);
        requestAnimationFrame(() => {
            context.putImageData(new ImageData(data, SIZE, SIZE), 0, 0);
        });
    }, 1000 / FPS);
}

main().catch(console.error);

console.log(window);