import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default {
  entry: 'src/index.js',
  dest: 'index.js',
  format: 'cjs',
  moduleName: 'module',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    uglify()
  ],
};