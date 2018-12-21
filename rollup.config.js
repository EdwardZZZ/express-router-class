import { terser } from "rollup-plugin-terser";
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  dest: 'index.js',
  format: 'cjs',
  moduleName: 'module',
  plugins: [
    terser({
      mangle: false,
      compress: false,
      output: {
        beautify: true,
      },
    }),
    nodeResolve({
      browser: false
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