import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  dest: 'index.js',
  format: 'cjs',
  moduleName: 'module',
  // sourceMap: 'inline',
  plugins: [
    // babel({
    //   exclude: 'node_modules/**',
    //   runtimeHelpers: true
    // }),
    // eslint()
    // uglify()
  ],
};