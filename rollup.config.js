import { terser } from "rollup-plugin-terser";
import nodeResolve from 'rollup-plugin-node-resolve';

const prod = process.env.NODE_ENV === 'production';

const config = {
    entry: 'src/index.js',
    dest: 'index.js',
    format: 'cjs',
    plugins: [
        terser({
            mangle: prod,
            compress: false,
            toplevel: true,
            output: {
                beautify: true,
            },
        }),
        nodeResolve({
            browser: false,
        }),
    ],
    external: [
        'fs',
        'path',
        'express',
        'path',
        'path-to-regexp'
    ],
};

export default config;