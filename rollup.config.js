import nodeResolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default {
    input: 'index.js',
    output: {
        file: 'dist/index.js',
        format: 'esm',
    },
    plugins: [
        nodeResolve(),
        copy({
            targets: [
                { src: 'pkg/*.wasm', dest: 'dist/' },
            ],
        }),
    ],
};
