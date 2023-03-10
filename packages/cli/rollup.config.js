import shebang from 'rollup-plugin-preserve-shebang';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: {
    file: './bin/cli.js',
    format: 'es',
  },
  plugins: [typescript(), shebang()],
};
