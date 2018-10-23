import uglify from 'rollup-plugin-uglify-es';

export default {
  entry: 'src/index.js',
  dest: 'index.js',
  format: 'cjs',
  moduleName: 'module',
  plugins: [
    uglify({
      mangle: false,
      compress: false,
      output: {
        beautify: true,
      },
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