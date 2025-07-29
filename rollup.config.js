import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/gpt.js',
        format: 'iife',
        name: 'Xad',
        plugins: [terser()]
      },
      {
        file: 'dist/gpt.mjs',
        format: 'es'
      }
    ]
  }
];
